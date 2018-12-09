importScripts( '/js/idb.js' );
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
          '/js/idb.js',
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


// self.addEventListener('fetch', event => {
//   event.respondWith(
//     // Add cache.put to cache images on each fetch
//      caches.match(event.request, { 'ignoreSearch': true }).then(response => {
//       return response || fetch(event.request).then(fetchResponse => {
//         return caches.open(staticCacheName).then(cache => {
//           cache.put(event.request.url, fetchResponse.clone());
//           return fetchResponse;
//         });
//       });
//     })

//   );
// });

self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then(response => {
			if (response) {
				return response;
			}
			// console.log('Network request for ', event.request.url);
			return fetch(event.request).then(networkResponse => {
				if (networkResponse.status === 404) {
					return;
				}
				return caches.open(staticCacheName).then(cache => {
					cache.put(event.request.url, networkResponse.clone());
					// console.log('Fetched and
					return networkResponse;
				})
			})
		}).catch(error => {
			console.log('Error:', error);
			return;
		})
	);
});

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('sync', function (event) {
	if (event.tag == 'serverSync') {
		const DBOpenRequest = indexedDB.open('restaurants', 1);
		DBOpenRequest.onsuccess = function (e) {
			db = DBOpenRequest.result;
			let tx = db.transaction('offline-reviews', 'readwrite');
			let store = tx.objectStore('offline-reviews');
			// Get added reviews while offline
			let request = store.getAll();
			request.onsuccess = function () {
				// POST offline reviews to network when online
				for (let i = 0; i < request.result.length; i++) {
					fetch(`http://localhost:1337/reviews/`, {
						body: JSON.stringify(request.result[i]),
						cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
						credentials: 'same-origin', 
						headers: {
							'content-type': 'application/json'
						},
						method: 'POST',
						mode: 'cors', 
						redirect: 'follow',
						referrer: 'no-referrer',
					})
					.then(response => {
						return response.json();
					})
					.then(data => {
						let tx = db.transaction('all-reviews', 'readwrite');
						let store = tx.objectStore('all-reviews');
						let request = store.add(data);
						request.onsuccess = function (data) {
							// add review to view
							let tx = db.transaction('offline-reviews', 'readwrite');
							let store = tx.objectStore('offline-reviews');
							let request = store.clear();
							request.onsuccess = function () { };
							request.onerror = function (error) {
								console.log('offline-reviews objectStore not cleared', error);
							}
						};
						request.onerror = function (error) {
							console.log('Adding objectStore to IDB failed', error);
						}
					})
					.catch(error => {
						console.log('POST fetch fail', error);
					})
				}
			}
			request.onerror = function (e) {
				console.log(e);
			}
		}
		DBOpenRequest.onerror = function (e) {
			console.log(e);
		}
	}
});