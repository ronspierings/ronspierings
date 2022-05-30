var cacheCompleted = false;
cacheData = {
    amount: 0,
    totalSize: 0,
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
        
        console.log("Received geo-data.json", result);
        
        // Place the markers on the map
        placeObjectsOnMap(result);
    });
}

/*
    The "Start Tour" button

*/

function startTour() 
{
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
        alert("Fout bij het ophalen van de locaties. Contacteer de organisatie.");
        return;
    }

    for(let item of data.entries)
    {
        let event = new CustomEvent("placeMarker", { detail: item } );
        window.dispatchEvent(event);
    }
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
            return res.json();
        }
        else {
            // When call fails, save an empty object
            let empty = {
                fields: [],
                entries: [],
                total: 0
            };

            return empty;
        }
        
    }).catch((res) => {
        // @todo Error handling on geo-data call...

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
            console.log("keys:", keys);

            cacheData.amount = keys.length;

            // Update the UI
            updateCacheDataUI();

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
    document.getElementById("txtCacheAmount").innerText = cacheData.amount;
    document.getElementById("txtCacheSize").innerText = cacheData.totalSize;
    document.getElementById("txtCacheLastUpdate").innerText = cacheData.lastUpdate;
    document.getElementById("txtCacheName").innerText = cacheData.cacheName;

}