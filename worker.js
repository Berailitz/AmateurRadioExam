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
          './static/js/material.min.js',
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

self.addEventListener('fetch', event => {
  if (event.request.method != 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) {
      event.waitUntil(cache.add(event.request));
      return cachedResponse;
    }
    return fetch(event.request);
  })());
});
