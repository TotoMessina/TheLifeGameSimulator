const CACHE_NAME = 'sim-vida-v5'; // Bump version to forcefuly update
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

self.addEventListener('install', (e) => {
  // Force this SW to become the active one, kicking out the old one
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});

self.addEventListener('activate', (e) => {
  // Take control of all clients immediately
  e.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Removing old cache:", key);
            return caches.delete(key);
          }
        }));
      })
    ])
  );
});
