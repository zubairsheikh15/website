// Service Worker for Zee Crown
const CACHE_NAME = 'zee-crown-v1';
const STATIC_CACHE = 'zee-crown-static-v1';
const DYNAMIC_CACHE = 'zee-crown-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/icon.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Take control immediately
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Strategy: Cache First for static assets, Network First for API calls
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // For static assets (images, CSS, JS), use cache first
      if (cachedResponse && (
        request.url.includes('/_next/static') ||
        request.url.includes('/logo.png') ||
        request.url.includes('/icon.png') ||
        request.url.match(/\.(jpg|jpeg|png|gif|svg|css|js|woff|woff2|ttf|eot)$/i)
      )) {
        return cachedResponse;
      }

      // For API calls and pages, try network first
      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache successful responses
          if (request.url.includes('/api/') || request.url.match(/^https?:\/\/[^\/]+\//)) {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // Network failed, try cache
          if (cachedResponse) {
            return cachedResponse;
          }

          // If it's a navigation request and cache fails, return offline page
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});

// Background sync for offline actions (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(
      // Sync cart data when back online
      console.log('[Service Worker] Syncing cart data...')
    );
  }
});

// Push notifications (optional)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Zee Crown';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

