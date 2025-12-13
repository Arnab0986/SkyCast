// Service Worker for SkyCast PWA
const CACHE_NAME = 'skycast-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon/icon-192.png',
  '/icon/icon-512.png',
  '/icon/favicon-32.png',
  '/icon/apple-touch-icon.png'
];

// Network-first resources (don't cache)
const NETWORK_FIRST_URLS = [
  /\/api\/ai-forecast/,
  /api\.open-meteo\.com/,
  /air-quality-api\.open-meteo\.com/,
  /geocoding-api\.open-meteo\.com/,
  /pagead2\.googlesyndication\.com/,
  /google-analytics\.com/,
  /doubleclick\.net/
];

// Cache-first resources (always cache)
const CACHE_FIRST_URLS = [
  /cdn\.jsdelivr\.net/,
  /cdnjs\.cloudflare\.com/,
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/
];

// Install event - cache essential resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Check if URL matches network-first pattern
  for (const pattern of NETWORK_FIRST_URLS) {
    if (pattern.test(url.href)) {
      event.respondWith(networkFirstStrategy(event.request));
      return;
    }
  }
  
  // Check if URL matches cache-first pattern
  for (const pattern of CACHE_FIRST_URLS) {
    if (pattern.test(url.href)) {
      event.respondWith(cacheFirstStrategy(event.request));
      return;
    }
  }
  
  // Default: cache-first with network fallback for same-origin requests
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirstStrategy(event.request));
  } else {
    // For cross-origin, try network first
    event.respondWith(networkFirstStrategy(event.request));
  }
});

// Network-first strategy
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // If successful, cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If both fail and it's a navigation request, return offline page
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    
    // Otherwise return error response
    return new Response('Network error', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Cache-first strategy
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetchAndCache(request);
    return cachedResponse;
  }
  
  // Not in cache, try network
  try {
    const networkResponse = await fetch(request);
    
    // Cache the response for future use
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    
    return new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Fetch and cache in background
async function fetchAndCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response);
    }
  } catch (error) {
    // Silently fail - we already have cached version
  }
}

// Background sync for weather data
self.addEventListener('sync', event => {
  if (event.tag === 'sync-weather') {
    event.waitUntil(syncWeatherData());
  }
});

// Sync weather data in background
async function syncWeatherData() {
  // This would sync weather data when device comes online
  console.log('Background sync triggered');
}

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'SkyCast Weather Update',
    icon: 'icon/icon-192.png',
    badge: 'icon/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Forecast',
        icon: 'icon/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: 'icon/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SkyCast Weather', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});