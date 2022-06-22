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

const staticCacheName = 'music-cache-v3';

const baseUrl = 'https://r-spierings.nl/'; 

// Register a BroadCastChannel for messaging
const broadcast = new BroadcastChannel('sw-update-channel');

  // Place the files to cache here! 
var filesToCache = [
  'js/leaflet-src.js',
  'index.html',
  'js/Leaflet.AccuratePosition.js',
  'js/pouchdb.js',
  'js/Leaflet.TileLayer.PouchDBCached.js',
  'js/vendor/modernizr-3.11.2.min.js',
  'js/plugins.js',
  'cache/route.json'
];

// service-worker.js
self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(staticCacheName)
      .then(cache => {
        
        broadcast.postMessage({type: 'CACHE_START_DOWNLOADING'});

        // First, Cache some default files
        for(let item of filesToCache)
        {
          cache.add(item);
        }

        // Next, download every sound location and Cache every sound file
        fetch('https://r-spierings.nl/AudioTourOssAdmin/api/collections/get/SoundLocation?token=bb9d57d773bcc3e75e1347f43b5d48')
        .then(response => {
          return response.json();
        })
        .then(responseJson => {          
          if(responseJson.entries != undefined)
          {
            for(let item of responseJson.entries)
            {
              console.log("Adding to cache:", baseUrl + item.mp3file);
              cache.add(baseUrl + item.mp3file).then(result => {
                // broadcast.postMessage({type: 'CACHE_FILE_ADDED'});
              });
            }      
            broadcast.postMessage({type: 'CACHE_COMPLETED'});        
          }
        })
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
          console.info("Fetching from cache:", evt.request)
          return res;
        }
        else 1
        {
          // No, we do not. Send out a network request
          if(evt.request.url.indexOf(".mp3") >= 0)
          {
            console.warn('MP3 file downloaded from network :( ');
          }
          //console.log("Fetching from network:", evt.request)
          return fetch(evt.request);
        }
      })
    );
  });