/**
 * Local auth stub — replaces Firebase Auth.
 *
 * All functions that previously depended on firebase/auth now use
 * cookie-based sessions. These stubs keep existing import paths
 * working while the migration is in progress.
 */

export const userSignOut = async () => {
  const apiHost = import.meta.env.VITE_API_HOST || '/oa';
  try {
    await fetch(`${apiHost}/api/v3/users/logout`, {
      credentials: 'include',
    });
  } catch {
    // Ignore — logout is best-effort
  }
};

export const currentAuthUser = () => {
  // No longer used — auth is cookie-based.
  // Return null to indicate "no Firebase user".
  return null;
};

export const setAuthPersistence = async () => {
  // No-op — cookies handle persistence
};

export const userSignInCustomToken = async (_code: string) => {
  // No-op — custom tokens are not used in local mode
  return null;
};

export const userSignInPopup = async (_provider: unknown) => {
  // No-op — OAuth popup is not used in local mode
  return null;
};

export const authProvider = {
  GitHub: null,
  Google: null,
  Microsoft: null,
  Yahoo: null,
};
