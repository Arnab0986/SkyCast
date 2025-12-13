// sw.js - Service Worker for SkyCast PWA
const CACHE_NAME = 'skycast-v3';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const API_CACHE = `${CACHE_NAME}-api`;

// Cache on install
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json'
        ]);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate and clean old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.startsWith(CACHE_NAME)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests (network first)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request);
        })
    );
    return;
  }
  
  // Handle static assets (cache first)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              // Don't cache if not successful
              if (!response.ok) {
                return response;
              }
              
              const responseClone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
              
              return response;
            })
            .catch(() => {
              // If fetch fails and it's a page request, return offline page
              if (request.mode === 'navigate') {
                return caches.match('/index.html');
              }
            });
        })
    );
    return;
  }
});