// Application start
startApplication();

function startApplication() 
{
    console.log("Start de applicatie!");

    // Retrieve the json data
    retrieveGeoData('https://r-spierings.nl/AudioTourOssAdmin/api/collections/get/SoundLocation?token=bb9d57d773bcc3e75e1347f43b5d48', (result) => {
        // Save the geo-data to the localStorage
        localStorage.setItem("geo-data", JSON.stringify(result));
        
        console.log("Received geo-data.json", result);
        
        // Place the markers on the map
        placeObjectsOnMap(result);
    });
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
            return [];
        }
        
    }).catch((res) => {
        // Error handling on geo-data call...

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
        return [];
    }
    else 
    {
        // Parse the textual geo-data to JSON format
        let fullData =  JSON.parse(data);

        // Return only the .entries
        return fullData.entries;
    }
}