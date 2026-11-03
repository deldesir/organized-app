import { NotificationDbRecordType } from '@definition/notification';
import { apiDefault } from './common';

export const apiFetchNotifications = async () => {
  const { appLang, roles, isOnline } = await apiDefault();

  // Self-hosted / offline-first: announcements come from a configurable
  // endpoint instead of the hard-coded notifications.organized-app.com cloud
  // service. When no endpoint is configured (or the box is offline), the
  // feature is simply disabled — no third-party SaaS is contacted.
  const url = import.meta.env.VITE_NOTIFICATIONS_API;

  if (!url || !isOnline) {
    return [] as NotificationDbRecordType[];
  }

  const res = await fetch(`${url}/${appLang}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      roles: roles.join(','),
    },
  });

  const data = await res.json();

  if (res.status !== 200 && res.status !== 304) {
    throw new Error(data.message);
  }

  return data as NotificationDbRecordType[];
};
