import * as Sentry from '@sentry/react';

// Self-sovereign: only initialise Sentry when a DSN is explicitly provided.
// Offline / self-hosted builds leave VITE_SENTRY_DSN unset, so the SDK never
// initialises and no telemetry leaves the box.
const dsn = import.meta.env.VITE_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    release: `v${import.meta.env.PACKAGE_VERSION}`,
    environment: import.meta.env.VITE_APP_MODE || 'PROD',
  });
}

export default Sentry;
