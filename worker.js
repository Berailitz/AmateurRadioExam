self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('offline').then((cache) => {
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
    fetch(event.request).catch((_) => caches.match(event.request))
  );
});
