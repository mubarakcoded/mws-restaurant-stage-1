const staticCacheName = 'restaurant-app-v1';
var allCaches = [
  staticCacheName
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        './',
        './index.html',
        './restaurant.html',
        './data/restaurants.json',
        './js/main.js',
        './js/dbhelper.js',
        './js/restaurant_info.js',
        './css/style.css',
        './css/responsive.css',
        './restaurant.html?id=1',
        './restaurant.html?id=2',
        './restaurant.html?id=3',
        './restaurant.html?id=4',
        './restaurant.html?id=5',
        './restaurant.html?id=6',
        './restaurant.html?id=7',
        './restaurant.html?id=8',
        './restaurant.html?id=9',
        './restaurant.html?id=10'
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restaurant-') &&
                 !allCaches.includes(cacheName);
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then(response => response || fetch(event.request)),
  );
});

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});