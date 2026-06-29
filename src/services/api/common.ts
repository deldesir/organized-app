import { store } from '@states/index';
import {
  apiHostState,
  appLangState,
  isOnlineState,
  userIDState,
} from '@states/app';
import { congIDState, congRoleState, JWLangState } from '@states/settings';

export const apiDefault = async () => {
  const apiHost = store.get(apiHostState) || import.meta.env.VITE_API_HOST || '/organized';
  const appVersion = import.meta.env.PACKAGE_VERSION;
  const appLang = store.get(appLangState);
  const congID = store.get(congIDState);
  const isOnline = store.get(isOnlineState);
  const JWLang = store.get(JWLangState);
  const userID = store.get(userIDState);
  const roles = store.get(congRoleState);

  return {
    apiHost,
    appVersion,
    userUID: userID, // Use userID from state (set by login)
    appLang,
    congID,
    isOnline,
    JWLang,
    userID,
    idToken: '', // Cookie-based auth — no bearer token needed
    roles,
  };
};
