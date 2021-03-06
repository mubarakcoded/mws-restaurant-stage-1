
class DBHelper {
  
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
	 * IndexedDB Promised
	 */
	static get dbPromise() {
		if (!navigator.serviceWorker) {
			return Promise.resolve();
		} else {
			return idb.open('restaurants', 1, function (upgradeDb) {
				upgradeDb.createObjectStore('all-restaurants', { keyPath: 'id' });
				upgradeDb.createObjectStore('all-reviews', { keyPath: 'id' });
				upgradeDb.createObjectStore('offline-reviews', { keyPath: 'updatedAt' });
			});
		}
	}

  // /**
  //  * Fetch all restaurants.
  //  */
  

  static fetchRestaurants(callback) {
		DBHelper.dbPromise.then(db => {
			if (!db) return;
			// 1. Look for restaurants in IDB
			const tx = db.transaction('all-restaurants');
			const store = tx.objectStore('all-restaurants');
			return store.getAll().then(restaurants => {
				if (!restaurants || restaurants.length === 0) {
					// if No restaurants in IDB found
					// then Fetch restaurants from network
					fetch(`${DBHelper.DATABASE_URL}`)
					.then(response => {
            const restaurants = response.json();
            return restaurants;
					})
					.then(restaurants => {
						// Restaurants fetched from network
						// save the restaurants into IDB
						const tx = db.transaction('all-restaurants', 'readwrite');
						const store = tx.objectStore('all-restaurants');
						restaurants.forEach(restaurant => {
							store.put(restaurant);
						})
						callback(null, restaurants);
					})
					.catch(error => {
						// Unable to fetch from network
						callback(error, null);
					});
				} else {
          
          // Restaurants found in IDB
          
					callback(null, restaurants);
				}
			})
			
		});
  }

  /**
	 * Fetch all reviews for a restaurant
	 */
	static fetchRestaurantReviews(restaurant, callback) {
		DBHelper.dbPromise.then(db => {
			if (!db) return;
			// Check reviews in the IDB
			const tx = db.transaction('all-reviews');
			const store = tx.objectStore('all-reviews');
		  store.getAll().then(results => {   
				if (results && results.length > 0) {
					// Use reviews from IDB
					callback(null, results);
				} else {
					// if no reviews in the IDB, fetch from the network
					fetch(`http://localhost:1337/reviews/?restaurant_id=${restaurant.id}`)
					.then(response => {
						return response.json();
					})
					.then(reviews => {
						this.dbPromise.then(db => {
							if (!db) return;
							// Add reviews to IDB
							const tx = db.transaction('all-reviews', 'readwrite');
							const store = tx.objectStore('all-reviews');
							reviews.forEach(review => {
								store.put(review);
							})
						});
						// Continue with reviews from network
						callback(null, reviews);
					})
					.catch(error => {
						// Unable to fetch reviews from network
						callback(error, null);
					})
				}
			})
		});
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/images/${restaurant.id}`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 


  static submitReview(data) {
		console.log(data);
		data['updatedAt'] = new Date().getTime();
		data['createdAt'] = new Date().getTime();
		
		return fetch(`http://localhost:1337/reviews`, {
			body: JSON.stringify(data), 
			cache: 'no-cache',
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
			response.json()
				.then(data => {
					this.dbPromise.then(db => {
						if (!db) return;
						// Put fetched reviews into IDB
						const tx = db.transaction('all-reviews', 'readwrite');
						const store = tx.objectStore('all-reviews');
						store.put(data);
					});
					return data;
				})
		})
		.catch(error => {
			// Network offline.
			 
			data['updatedAt'] = new Date().getTime();
			data['createdAt'] = new Date().getTime();
			console.log(data);
			
			this.dbPromise.then(db => {
				if (!db) return;
				// Put fetched reviews into IDB
				const tx = db.transaction('offline-reviews', 'readwrite');
				const store = tx.objectStore('offline-reviews');
        store.put(data);
				console.log('Review stored offline in IDB');
			});
			return;
		});
	}

	static submitOfflineReviews() {
		DBHelper.dbPromise.then(db => {
			if (!db) return;
			const tx = db.transaction('offline-reviews');
			const store = tx.objectStore('offline-reviews');
			store.getAll().then(offlineReviews => {
				console.log(offlineReviews);
				offlineReviews.forEach(review => {
					DBHelper.submitReview(review);
				})
				DBHelper.clearOfflineReviews();
			})
		})
  }

  // static submitOff() {
	// 	DBHelper.dbPromise.then(db => {
	// 		if (!db) return;
	// 		  const tx = db.transaction('all-reviews', 'readwrite');
	// 			const store = tx.objectStore('all-reviews');
  //       store.put(data);
	// 			console.log('All Review updated in IDB');
			
	// 	})
  // }

	static clearOfflineReviews() {
		DBHelper.dbPromise.then(db => {
			const tx = db.transaction('offline-reviews', 'readwrite');
			const store = tx.objectStore('offline-reviews').clear();
		})
		return;
	}


  static toggleFavorite(restaurant, isFavorite) {
		fetch(`${DBHelper.DATABASE_URL}/${restaurant.id}/?is_favorite=${isFavorite}`, {
			method: 'PUT'
		})
		.then(response => {
			return response.json();
		})
		.then(data => {
			DBHelper.dbPromise.then(db => {
				if (!db) return;
				const tx = db.transaction('all-restaurants', 'readwrite');
				const store = tx.objectStore('all-restaurants');
				store.put(data)
			});
			return data;
		})
		.catch(error => {
			restaurant.is_favorite = isFavorite;
			DBHelper.dbPromise.then(db => {
				if (!db) return;
				const tx = db.transaction('all-restaurants', 'readwrite');
				const store = tx.objectStore('all-restaurants');
				store.put(restaurant);
			}).catch(error => {
				console.log(error);
				return;
			});
		});
	}
}