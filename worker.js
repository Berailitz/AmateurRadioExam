const cacheName = 'offline';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return Promise.all([cache.addAll(
        [
          './static/css/base.css',
          './static/css/material-icons.css',
          './static/css/material.brown-red.min.css',
          './static/css/MaterialIcons-Regular.woff2',
          './static/js/base.js',
          './static/js/index.js',
          './static/js/questionList.js',
          './index.html'
        ]
      ).catch((e) => console.log(`Unable to cache: ${e}.`)),
      cache.addAll(
        [
          './'
        ]
      ).catch((_) => console.log(`Unable to cache root directory.`))]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cacheResponse) => {
      return cacheResponse || fetch(event.request).then((fetchResponse) => {
        return caches.open(cacheName).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });  
      });
    })
  );
});
