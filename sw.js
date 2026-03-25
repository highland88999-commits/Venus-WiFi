const CACHE_NAME = 'artemis-omega-v3';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/leaflet/dist/leaflet.css',
  'https://unpkg.com/leaflet/dist/leaflet.js',
  'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css',
  'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js'
];

// Install Event - Caching App Core Assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Artemis Shield: Hardening core defenses...");
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting(); // Force active takeover
});

// Activate Event - Purging legacy cached builds
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Artemis Shield: Purging legacy cache protocols", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch Event - Stale-while-revalidate for local assets, network-first for APIs
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Bypass Cache for Dynamic API calls (Routing Machine, Weather, OpenData)
  if (url.hostname.includes('router.project-osrm.org') || 
      url.hostname.includes('open-meteo.com') || 
      url.hostname.includes('data.edmonton.ca')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // Cache-First for static libraries & local files
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(e.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Only cache successful standard GET requests
          if (e.request.method === "GET" && networkResponse.status === 200) {
            cache.put(e.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    })
  );
});
