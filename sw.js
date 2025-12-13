// sw.js - Service Worker for SkyCast PWA
const CACHE_VERSION = 'skycast-v3.1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Essential files to cache on install
const STATIC_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon/icon-192.png',
  '/icon/icon-512.png'
];

// External resources to cache
const EXTERNAL_RESOURCES = [
  'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(STATIC_URLS);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Install failed:', error);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches that don't match current version
          if (!cacheName.startsWith(CACHE_VERSION)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event with intelligent strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Handle API requests (network-first)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCacheFallback(request));
    return;
  }
  
  // Handle weather API requests (stale-while-revalidate)
  if (url.hostname.includes('open-meteo.com') || url.hostname.includes('ipapi.co')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // Handle CDN resources (cache-first)
  if (url.hostname.includes('cdn.jsdelivr.net') || 
      url.hostname.includes('cdnjs.cloudflare.com') ||
      url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirstWithNetworkFallback(request));
    return;
  }
  
  // Handle ads (network-only, don't cache)
  if (url.hostname.includes('googlesyndication.com') ||
      url.hostname.includes('doubleclick.net') ||
      url.hostname.includes('google-analytics.com')) {
    event.respondWith(networkOnly(request));
    return;
  }
  
  // Default strategy for same-origin (cache-first)
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirstWithNetworkFallback(request));
  } else {
    // Cross-origin: try network first
    event.respondWith(networkFirstWithCacheFallback(request));
  }
});

// Strategy: Network first, fallback to cache
async function networkFirstWithCacheFallback(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[Service Worker] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // If it's a navigation request and we're offline
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    
    // Return offline response
    return new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Strategy: Cache first, fallback to network
async function cacheFirstWithNetworkFallback(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    updateCacheInBackground(request);
    return cachedResponse;
  }
  
  try {
    // Not in cache, try network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Both cache and network failed
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    
    return new Response('Resource not available', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Strategy: Stale while revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Return cached response immediately
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      // Update cache with fresh response
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Silently fail - we already returned cached response
  });
  
  // Return cached response if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Strategy: Network only (for ads)
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Return empty response for ads if offline
    return new Response('', {
      status: 204,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Update cache in background
async function updateCacheInBackground(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, response);
    }
  } catch (error) {
    // Silently fail - we have cached version
  }
}

// Background sync for weather updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-weather') {
    console.log('[Service Worker] Background sync: weather data');
    event.waitUntil(syncWeatherData());
  }
});

async function syncWeatherData() {
  const cache = await caches.open(API_CACHE);
  const requests = await cache.keys();
  
  // Find weather API requests to refresh
  const weatherRequests = requests.filter(request => 
    request.url.includes('open-meteo.com') ||
    request.url.includes('ipapi.co')
  );
  
  for (const request of weatherRequests) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(request, response);
        console.log('[Service Worker] Updated cache for:', request.url);
      }
    } catch (error) {
      console.log('[Service Worker] Failed to update:', request.url);
    }
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  let data = {
    title: 'SkyCast Weather Update',
    body: 'New weather forecast available',
    icon: '/icon/icon-192.png',
    badge: '/icon/icon-192.png'
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View Forecast',
        icon: '/icon/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon/icon-192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Periodic sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-weather') {
      event.waitUntil(syncWeatherData());
    }
  });
}