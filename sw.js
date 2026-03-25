const CACHE_NAME = 'artemis-tactical-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  // Localizing these prevents "White Screen" if Leaflet's CDN is down
  'https://unpkg.com/leaflet/dist/leaflet.css',
  'https://unpkg.com/leaflet/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js'
];

// Install and Cache Assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Artemis Shield: Caching Core Assets");
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Force the new service worker to take over immediately
});

// Activate and Clean Old Caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Artemis Shield: Purging Legacy Cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Offline Fetch Strategy
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
