// Start the application!
startApplication();

function startApplication() 
{
    // Retrieve the json data
    retrieveGeoData('/js/geo-data.json', (result) => {
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
    for(let item of data)
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
    .then(res => res.json())
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
        return JSON.parse(data);
    }
}