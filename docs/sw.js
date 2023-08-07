MYCACHE = 'v16';

this.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(MYCACHE).then(function(cache) {
      return cache.addAll([
        '/nimTUROCHAMP/',
        '/nimTUROCHAMP/app.js',
        '/nimTUROCHAMP/chess.js',
        '/nimTUROCHAMP/chessboard.css',
        '/nimTUROCHAMP/chessboard.js',
        '/nimTUROCHAMP/chesspieces.svg',
        '/nimTUROCHAMP/fav192.png',
        '/nimTUROCHAMP/fav512.png',
        '/nimTUROCHAMP/favicon.png',
        '/nimTUROCHAMP/index.html',
        '/nimTUROCHAMP/ntcjs.js',
        '/nimTUROCHAMP/turing.png',
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200) {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(MYCACHE)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

this.addEventListener('activate', function(event) {
  var cacheWhitelist = [MYCACHE];

  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (cacheWhitelist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});


