const staticCacheName = 'music-cache-v1';

const filesToCache = [
  'cache/bensound-energy.mp3',
  'cache/bensound-sunny.mp3',
  'cache/bensound-funnysong.mp3',
  'cache/bensound-onceagain.mp3'
];

// service-worker.js
self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(staticCacheName)
      .then(cache => {
        console.log("Files added to cache:", filesToCache);        
        return cache.addAll(filesToCache);
      })
    );
  });
  self.addEventListener("activate", event => {
    // console.log('Activate!');
  });
  self.addEventListener("fetch", (evt) => {
    // Send out self written response
    evt.respondWith(
      // Has the requested file a match in the Cache?
      caches.match(evt.request)
      .then((res) => { 
        // Yes we do! Send out the cached file
        if(res)
        {
          console.log("Fetching from cache:", evt.request)
          return res;
        }
        else 
        {
          // No, we do not. Send out a network request
          console.log("Fetching from network:", evt.request)
          return fetch(evt.request);
        }
      })
    );
  });