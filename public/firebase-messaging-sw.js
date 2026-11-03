/* eslint-disable no-undef */

// Inert service worker — Firebase Cloud Messaging is intentionally disabled.
//
// The self-hosted Organized deployment does not use FCM: push/notification
// delivery is handled server-side (RapidPro / WuzAPI) by organized-backend.
// The original version of this file pulled the Firebase SDK from the
// gstatic.com CDN at runtime, which is a cloud dependency and cannot work
// offline. That has been removed so the app contacts no external host.
//
// This stub keeps the /firebase-messaging-sw.js path valid (in case any
// cached client still references it) while doing nothing.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
