import { useEffect, useState } from 'react';
import worker from '@services/worker/backupWorker';
import { setCurrentProvider } from '@services/states/app';

const useFirebaseAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for existing session by calling validate-me
    const apiHost = import.meta.env.VITE_API_HOST || '/organized';
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
      const apiHost = import.meta.env.VITE_API_HOST || '/organized';
      const credentials = btoa(`${username}:${password}`);

      const res = await fetch(`${apiHost}/api/v3/user-login`, {
        headers: { Authorization: `Bearer ${credentials}` },
        credentials: 'include', // Accept Set-Cookie from server
      });

      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setUser({
          uid: data.id,
          providerData: [{ providerId: 'local' }],
        });
        setCurrentProvider('local');
        worker.postMessage({ field: 'userID', value: data.id });
        return true;
      }
    } catch (e) {
      console.error('Login failed', e);
    }
    return false;
  };

  const logout = async () => {
    try {
      const apiHost = import.meta.env.VITE_API_HOST || '/organized';
      await fetch(`${apiHost}/api/v3/users/logout`, {
        credentials: 'include',
      });
    } catch {
      // Ignore errors on logout
    }
    setIsAuthenticated(false);
    setUser(null);
  };

  return { isAuthenticated, user, login, logout };
};

export default useFirebaseAuth;
