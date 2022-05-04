// Update this manually.
const BUILD_MMR = '1.0.0';
// These are updated automatically by the build.
const BUILD_DATE = '20220405';
const BUILD_NUMBER = '1';
const APP_VERSION = `${BUILD_MMR}.${BUILD_DATE}#${BUILD_NUMBER}`;
// Debug logging - update manually
const DEBUG_LOGGING = true;
const WORKBOX_DEBUG_LOGGING = false;
// Workbox version - update manually when there are new releases.
const WORKBOX_VERSION = '5.1.1';
// Cache naming and versioning.
const APP_CACHE_PREFIX = 'mct';
const APP_CACHE_SUFFIX = `v${BUILD_MMR}`;

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
          if(evt.request.url.indexOf(".mp3") >= 0)
          {
            console.log('%c mp3 file downloaded from network :( ', 'color: orange;');
          }
          //console.log("Fetching from network:", evt.request)
          return fetch(evt.request);
        }
      })
    );
  });