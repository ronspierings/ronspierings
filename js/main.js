var cacheCompleted = false;

cacheData = {
    amount: 0,
    totalSize: 0,
    totalAudioAmount: 15,
    lastUpdate: "Onbekend",
    cacheName: staticCacheName
}

// Listen to a cache complete event. This will only trigger on Install event of the service worker
broadcast.onmessage = (event) => {
    if (event.data && event.data.type === 'CACHE_COMPLETED') {
        // Set the latest update time to now
        cacheData.lastUpdate = new Date();
        cacheCompleted = true;
    }
};

// Application start
startApplication();

function startApplication() 
{
    console.log("Start de applicatie!");

    // Retrieve the json data
    retrieveGeoData(baseUrl + 'AudioTourOssAdmin/api/collections/get/SoundLocation?token=bb9d57d773bcc3e75e1347f43b5d48', (result) => {
        // Save the geo-data to the localStorage
        localStorage.setItem("geo-data", JSON.stringify(result));
        
        // Place the markers on the map
        placeObjectsOnMap(result);
    });

    // Do a extra cache call (only when there is a working internet connection)
    if(window.navigator.onLine == true)
    {
       // Hard refresh the cache
        refreshCache();
    }
}

/*
    The "Start Tour" button

*/

function startTour() 
{
    let result = confirm("Weet je zeker dat je de route wilt starten?");
    if(result == false)
    {
        return;
    }

    // Remove the splash screen
    document.getElementById("splash").remove();

    // Send out the "startTour" event
    let event = new CustomEvent("startTour", { detail: {} } );
    window.dispatchEvent(event);
}

/*
    Create a placeMarker event and send out to the world
*/

function placeObjectsOnMap(data)
{
    if(data.entries == undefined)
    {
        cacheData.totalAudioAmount = 0;
        alert("Fout bij het ophalen van de locaties. Contacteer de organisatie.");
        return;
    }

    // Store the amount of entries in the cache data
    cacheData.totalAudioAmount = data.entries.length;

    for(let item of data.entries)
    {
        let event = new CustomEvent("placeMarker", { detail: item } );
        window.dispatchEvent(event);        
    }

    // All the markers are placed, so send out a ready event
    let eventReady = new CustomEvent("placeMarkerReady");
    window.dispatchEvent(eventReady);
}

/*
    Create and make the GET request
    Do a callback when ready
*/
function retrieveGeoData(url, callback)
{
    // Make the Request
    fetch(url)
    .then(res => {
        if(res != null)
        {
            // Save the response in the localStorage
            let resJson = res.json();
            localStorage.setItem("geo-data", JSON.stringify(resJson));
            return resJson;
        }
        else 
        {
            // When call fails, save an empty object
            let empty = {
                fields: [],
                entries: [],
                total: 0
            };

            return empty;
        }
        
    }).catch((res) => {
        // @todo Error handling on geo-data call... use the cache?
        let cacheResult = window.localStorage.getItem("geo-data");
        cacheResultJson = {};
        
        if(cacheResult != null) 
        {
            cacheResultJson = JSON.parse(cacheResult);
        }
        else 
        {
            cacheResultJson = {
                fields: [],
                entries: [],
                total: 0
            };
        }
        debugger;

        console.log("Send out cached geo-data:", cacheResultJson);
        
        return cacheResultJson;

    })
    .then(data => obj = data)
    .then(() => callback(obj));
}

/*
    Helper functions
*/

// Retrieve geo data stored in the Session Storage
function getGeoData()
{
    let data = localStorage.getItem("geo-data");
    if(data == null)
    {
        // When the geo-data is empty, return a empty object
        return {
            entries: [],
            fields: [],
            total: 0
        }
    }
    else
    {
        // Parse the textual geo-data to JSON format
        return JSON.parse(data);
    }
}

// Retrieve data about the current cache
function getCacheData()
{
    caches.open(staticCacheName).then(cache => {
        cache.keys().then(keys => {

            // Only option so far.. The total amount :( 
            // TODO Lookup how to get the cache size in KB / MB
            cacheData.amount = keys.length;

            // Calculate the amount of 

            // Update the UI
            updateCacheDataUI();
        })
    });

}

// Refresh the MP3 Cache
function refreshCache()
{
    // caches.delete(staticCacheName);

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
                    // console.log("Adding to cache:", baseUrl + item.mp3file);
                    cache.add(baseUrl + item.mp3file).then(result => {
                        // console.log("Added to cache: ", result);
                    });
                }      
                broadcast.postMessage({type: 'CACHE_COMPLETED'});        
            }
        })
    });
}

// Show the cache info screen
function showCacheDataUI() 
{
    // Read the latest cache data. This function is async (Promise-based)
    getCacheData();

    // Show the screen
    document.getElementById("cacheInfoScreen").style.display = 'block';
}

// Update the UI on the caching data
function updateCacheDataUI()
{
    document.getElementById("txtCacheAmount").innerText = (cacheData.amount - filesToCache.length);
    document.getElementById("txtCacheSize").innerText = cacheData.totalSize;
    document.getElementById("txtCacheLastUpdate").innerText = cacheData.lastUpdate;
    document.getElementById("txtCacheName").innerText = cacheData.cacheName;
}