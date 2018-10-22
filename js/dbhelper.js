/**
 * Common database helper functions.
 */

// if (!window.indexedDB) {
//   window.alert("Your browser doesn't support a stable version of IndexedDB.")
// } 


// //this is indexedDB section and the functions interacting with indexedDB
// let db;
// const dbName = ' restaurant-app';
// const storeName = 'restaurants';
// //opening our indexed database declared as dbName version 1
// const request = window.indexedDB.open(dbName, 1)

// request.onerror = function(event) {
//   alert("an error had occured");
// };
// request.onsuccess = function(event) {
//   console.log(dbName, 'IndexedDB opened');
//   db = request.result;
//   console.log("success: "+ db);
// };
// request.onupgradeneeded = function(event) {
//   const db = event.target.result;
//   //Create Object store
//   var objectStore ;
//     objectStore = db.createObjectStore('all-restaurants', { keyPath: 'id' });
//     objectStore = db.createObjectStore('all-reviews', { keyPath: 'id' });
//     objectStore = db.createObjectStore('offline-reviews', { keyPath: 'updatedAt' });
//   console.log("Object Store created");
// }

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



  // static fetchRestaurants(callback) {
  //   fetch(DBHelper.DATABASE_URL)
  //     .then(response => {
  //       const restaurants = response.json();
  //       return restaurants;
  //     })
  //     .then(restaurants => callback(null, restaurants))
  //     .catch(err => callback(err, null));
  //   }
    /*

  // /**
  //  * Fetch all restaurants.
  //  */
  

  static fetchRestaurants(callback) {
		DBHelper.dbPromise.then(db => {
			if (!db) return;
			// 1. Look for restaurants in IDB
			const tx = db.transaction('all-restaurants');
			const store = tx.objectStore('all-restaurants');
			store.getAll().then(results => {
       

				if (!results ||results.length === 0) {
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
					callback(null, results);
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
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}

