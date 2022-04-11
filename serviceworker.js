const filesToCache = [
  'cache/bensound-energy.mp3',
  'cache/bensound-sunny.mp3',
  'cache/bensound-funnysong.mp3',
  'cache/bensound-onceagain.mp3'
];

const staticCacheName = 'music-cache-v1';



// service-worker.js
self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(staticCacheName)
      .then(cache => {
        return cache.addAll(filesToCache);
      })
    );
  });
  self.addEventListener("activate", event => {
    console.log('Activate!');
  });
  self.addEventListener('fetch', function(event) {
    console.log('Fetch!', event.request);
  });