//checking if browser support service worker
  //Register a service worker hosted at the root of the
  if ('serviceWorker' in navigator) {
    // Register a service worker hosted at the root of the
    // site using the default scope.
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      console.log('Service worker registration succeeded:', registration);

    }).catch(function(error) {
      console.log('Service worker registration failed:', error);
    });
  } else {
    console.log('Service workers are not supported.');
  }

  
  // Request a one-off sync:
navigator.serviceWorker.ready.then(function (swRegistration) {    
  return swRegistration.sync.register('serverSync');
});

function isOnline() {
  console.log('Server online');
  DBHelper.submitOfflineReviews();
}

function isOffline() {
  console.log('Server offline');
}

window.addEventListener('online', isOnline);
window.addEventListener('offline', isOffline);
isOnline();