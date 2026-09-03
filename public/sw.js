// Hartbeesfontein Veiligheid & Beheerkamer Service Worker
const CACHE_NAME = 'hv-beheer-pwa-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable.png',
  '/icons/apple-touch-icon.png',
  '/favicon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
];

// Install Event - Pre-cache App Shell & Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[HV-SW] Pre-caching offline application shell');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[HV-SW] Asset pre-cache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-while-revalidate for local assets, Network-First for API
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = request.url;

  // Don't intercept non-GET, chrome-extension, API routes, Vite dev server, or SSE streams
  if (
    request.method !== 'GET' ||
    !url.startsWith('http') ||
    url.includes('/api/') ||
    url.includes('/@') ||
    url.includes('/src/') ||
    url.includes('hot-update')
  ) {
    return;
  }

  // Handle SPA navigation requests - return cached index.html when offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedIndex = await cache.match('/index.html') || await cache.match('/');
        return cachedIndex || new Response('Hartbeesfontein Veiligheid is vanlyn beskikbaar.', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      })
    );
    return;
  }

  // Static Assets & Leaflet / CDN Styles
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and not in cache, return fallback if available
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Background Sync Event for Offline SOS Outbox Queue
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sos-outbox') {
    console.log('[HV-SW] Background sync triggered: sync-sos-outbox');
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'HV_TRIGGER_OFFLINE_SYNC' });
        });
      })
    );
  }
});

// Push Notification Event for Critical Alarms
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const title = data.title || 'Hartbeesfontein Veiligheid Noodwaarskuwing';
    const options = {
      body: data.body || 'Belangrike veiligheidskennisgewing vanaf beheerkamer.',
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      vibrate: [200, 100, 200, 100, 400],
      tag: data.tag || 'emergency-alert',
      data: data.data || { url: '/' }
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('[HV-SW] Push payload error:', err);
  }
});

// Notification Click Handler - Focus or open App
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
