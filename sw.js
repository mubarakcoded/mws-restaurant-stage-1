const staticCacheName = 'restaurant-app-v1';
var allCaches = [
  staticCacheName
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
          '/index.html',
          '/restaurant.html',
          '/css/styles.css',
          '/css/responsive.css',
          '/js/dbhelper.js',
          '/js/main.js',
          '/js/restaurant_info.js',
          '/data/restaurants.json',
          '/images/1-200_small_1x.jpg',
          '/images/2-200_small_1x.jpg',
          '/images/3-200_small_1x.jpg',
          '/images/4-200_small_1x.jpg',
          '/images/5-200_small_1x.jpg',
          '/images/6-200_small_1x.jpg',
          '/images/7-200_small_1x.jpg',
          '/images/8-200_small_1x.jpg',
          '/images/9-200_small_1x.jpg',
          '/images/10-200_small_1x.jpg',
          '/images/1-400_mid_2x.jpg',
          '/images/2-400_mid_2x.jpg',
          '/images/3-400_mid_2x.jpg',
          '/images/4-400_mid_2x.jpg',
          '/images/5-400_mid_2x.jpg',
          '/images/6-400_mid_2x.jpg',
          '/images/7-400_mid_2x.jpg',
          '/images/8-400_mid_2x.jpg',
          '/images/9-400_mid_2x.jpg',
          '/images/10-400_mid_2x.jpg',
          '/images/1-100pc_large_2x.jpg',
          '/images/2-100pc_large_2x.jpg',
          '/images/3-100pc_large_2x.jpg',
          '/images/4-100pc_large_2x.jpg',
          '/images/5-100pc_large_2x.jpg',
          '/images/6-100pc_large_2x.jpg',
          '/images/7-100pc_large_2x.jpg',
          '/images/8-100pc_large_2x.jpg',
          '/images/9-100pc_large_2x.jpg',
          '/images/10-100pc_large_2x.jpg'
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


self.addEventListener('fetch', event => {
  event.respondWith(
    // Add cache.put to cache images on each fetch
     caches.match(event.request, { 'ignoreSearch': true }).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        return caches.open(staticCacheName).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })

  );
});

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});