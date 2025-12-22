'use client';

import { useEffect } from 'react';

export default function CacheProvider() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[Service Worker] Registered successfully:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available, prompt user to refresh
                  if (confirm('New version available! Reload to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[Service Worker] Registration failed:', error);
        });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('[Service Worker] Message received:', event.data);
      });
    }

    // Preload critical resources
    const preloadResources = [
      '/logo.png',
      '/icon.png',
    ];

    preloadResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = resource.endsWith('.png') ? 'image' : 'fetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  }, []);

  return null;
}

