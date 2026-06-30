import { useEffect, useState } from 'react';
import worker from '@services/worker/backupWorker';
import { setCurrentProvider } from '@services/states/app';
import { dbAppSettingsUpdateWithoutNotice } from '@services/dexie/settings';

const useFirebaseAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for existing session by calling validate-me
    const apiHost = import.meta.env.VITE_API_HOST || '/oa';
    fetch(`${apiHost}/api/v3/users/validate-me`, {
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then((data) => {
        setIsAuthenticated(true);
        setUser({
          uid: data.id,
          providerData: [{ providerId: 'local' }],
        });
        setCurrentProvider('local');
        worker.postMessage({ field: 'userID', value: data.id });
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUser(null);
      });
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const apiHost = import.meta.env.VITE_API_HOST || '/oa';
      const credentials = btoa(`${username}:${password}`);

      const res = await fetch(`${apiHost}/api/v3/user-login`, {
        headers: { Authorization: `Bearer ${credentials}` },
        credentials: 'include', // Accept Set-Cookie from server
      });

      if (res.ok) {
        const data = await res.json();
        const us = data?.app_settings?.user_settings ?? {};
        const cs = data?.app_settings?.cong_settings ?? {};

        // Persist the congregation profile into the local DB before anything
        // else. The startup state machine (useStartup) gates on the local
        // cong_name and bounces back to the sign-in screen while it is empty;
        // the VIP auto-login query that would otherwise populate it runs async
        // and loses that race. Writing it here first makes post-login startup
        // proceed (to encryption/access-code setup, then the app).
        await dbAppSettingsUpdateWithoutNotice({
          'user_settings.id': data.id,
          'user_settings.account_type': 'vip',
          // firstname/lastname are { value, updatedAt } objects in the schema
          // (firstnameState reads `.value`); writing bare strings corrupts the
          // shape so `.value` is undefined and fullnameState crashes the app.
          'user_settings.firstname': { value: us.firstname ?? '', updatedAt: '' },
          'user_settings.lastname': { value: us.lastname ?? '', updatedAt: '' },
          'user_settings.cong_role': us.cong_role ?? [],
          'cong_settings.cong_name': cs.cong_name ?? '',
          'cong_settings.country_code': cs.country_code ?? '',
          // cong_id is needed so the admin onboarding endpoints
          // (congregations/admin/<id>/master-key, /access-code) build a valid
          // URL — without it the path becomes admin//master-key and 404s.
          'cong_settings.cong_id': cs.id ?? '',
        });

        setIsAuthenticated(true);
        setUser({
          uid: data.id,
          providerData: [{ providerId: 'local' }],
        });
        setCurrentProvider('local');
        worker.postMessage({ field: 'userID', value: data.id });

        // Signing in implies consent (so the startup flow doesn't drop back to
        // the terms gate), and flags startup to wait for the profile to hydrate
        // from the local DB after reload instead of bouncing to sign-in.
        try {
          localStorage.setItem('userConsent', 'accept');
          localStorage.setItem('justLoggedIn', '1');
        } catch {
          // ignore storage errors
        }

        // Re-run every auth-gated hook (startup, auto-login) now that the
        // session cookie is set and the profile is in the local DB. A full
        // reload is the reliable way — auth state here is per-hook local state.
        window.location.reload();
        return true;
      }
    } catch (e) {
      console.error('Login failed', e);
    }
    return false;
  };

  const logout = async () => {
    try {
      const apiHost = import.meta.env.VITE_API_HOST || '/oa';
      await fetch(`${apiHost}/api/v3/users/logout`, {
        credentials: 'include',
      });
    } catch {
      // Ignore errors on logout
    }
    try {
      localStorage.removeItem('justLoggedIn');
    } catch {
      // ignore storage errors
    }
    setIsAuthenticated(false);
    setUser(null);
  };

  return { isAuthenticated, user, login, logout };
};

export default useFirebaseAuth;
