const CACHE_NAME = 'messmisan-messenger-v1';
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js',
  'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js',
  'https://www.soundjay.com/buttons/beep-07.mp3'
  // Add any other static assets your app uses (e.g., images, other JS files)
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // For Firebase Realtime Database requests, let the browser handle them.
  // Firebase SDK has its own offline persistence.
  if (event.request.url.includes('firebaseio.com') || event.request.url.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and can only be consumed once. We must clone it so that
            // the browser can consume one and we can consume the other.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// --- Background Sync (Conceptual - requires more complex implementation) ---
// self.addEventListener('sync', event => {
//   if (event.tag === 'sync-pending-writes') {
//     event.waitUntil(syncPendingWrites()); // Function to push IndexedDB data to Firebase
//   }
// });

// function syncPendingWrites() {
//   // This function would read from IndexedDB, push to Firebase,
//   // and then clear the pending items.
//   // This is a complex part and requires a full IndexedDB setup.
//   console.log('Attempting to sync pending writes...');
//   return Promise.resolve(); // Placeholder
// }
