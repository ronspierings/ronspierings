var imgLocation = 'images/location.png';
var imgPlay = 'images/play.png';
var imgMarker = 'images/marker-icon-2x.png';

// Map Initialization
var map = L.map('map', 
{
    center: [51.505, -0.09],
    zoom: 18
});


/*
    Global vars
*/
var currentPosition = map.getCenter();
var currentSoundPosition = undefined;



// Layer initialiation
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
}).addTo(map);


// Do the GEO-location lookup (native function)
map.locate(
    {
        watch: true, // Continously updating
        enableHighAccuracy: true
        // setView: true // Set the map?
    }
)


// Do the accurate Geo-location lookup

map.findAccuratePosition({
    maxWait: 1000000,
    desiredAccuracy: 5,
});

/*
    Event Listeners
*/

map.on('accuratepositionprogress', onAccuratePositionProgress);
map.on('accuratepositionfound', onAccuratePositionFound);
map.on('accuratepositionerror', onAccuratePositionError);

map.on('locationfound', onLocationUpdate);
map.on('locationerror', notFoundLocation);

window.addEventListener("placeMarker", onPlacingMarker);


/*
    Icons
*/
var locationHereIcon = L.icon({
    iconUrl: imgLocation,
    iconSize: [24, 24],
});

var soundMarkerIcon = L.icon({
    iconUrl: imgPlay,
    iconAnchor: [12, 12]
});

var regularMarkerIcon = L.icon({
   iconUrl: imgMarker,
   iconSize: [25,41]
});


/*
    Markers
*/
var currentPositionMarker = L.marker([51.505, -0.09],
{
    icon: locationHereIcon,
}).addTo(map);


var thuis = L.marker([51.7078039375618, 5.300874116295497],
{
    icon: regularMarkerIcon,
    iconSize: [24,24]
}).addTo(map);


/*
    Event Functions (Listner functions)
*/

function onPlacingMarker(args)
{
    let marker = args.detail;

    // The Blue Circle (with a radius)
    let soundCirle = L.circle(marker.latlng, {
        radius: marker.radius,
        geoData: marker
    }).addTo(map);

    // The sound icon
    let soundMarker = L.marker(marker.latlng,  {
        icon: soundMarkerIcon,     
    }).addTo(map);
}

function onAccuratePositionError (e) 
{
    console.log("Error:");
}

function onAccuratePositionProgress (latlng) 
{
    currentPosition = latlng;

    refreshButtonPanel();
}

function onAccuratePositionFound (latlng) 
{
    onLocationUpdate(latlng);
}

function onLocationUpdate(lng)
{   
    // Update the global current Position variable
    currentPosition = lng;

    resetCentreMap();

    // Update the current position Marker
    currentPositionMarker.setLatLng(lng.latlng);

    // Retrieve the geo-data data from the local storage 
    let soundPoints = getGeoData();

    // Loop through all the soundPoints in the geo-data
    for(let soundPoint of soundPoints.entries)
    {
        let soundPointLatLng = L.latLng(soundPoint.latlng);
        let soundPointDistance = soundPointLatLng.distanceTo( lng.latlng );
        
        // Distance within radius?
        if(soundPointDistance < soundPoint.radius)
        {
            // And check if this position is different to the previous found
            // Because we cannot simply via value-check compare 2 objects, we need to stringify them
            if(JSON.stringify(currentSoundPosition) != JSON.stringify(soundPoint) )
            {
                // Set this new-found sound position as the current one
                currentSoundPosition = soundPoint;

                // Send out the "I found a location" event
                let event = new CustomEvent("locationInRange", { detail: soundPoint } );
                window.dispatchEvent(event);
            }
        }
    }

    // Refresh our lovely UI
    refreshButtonPanel();    
}

function notFoundLocation(e)
{
    alert("GPS Locatie niet gevonden");
}


/*
    Helper Functions
*/
function refreshButtonPanel() 
{
    // How far from home?
    let newDistance = thuis.getLatLng().distanceTo( currentPosition.latlng);

    document.querySelector("#txtDistance").innerText = newDistance.toFixed(2);
    document.querySelector("#txtAccurracy").innerText = Math.round( currentPosition.accuracy );

}

function resetCentreMap()
{
    map.setView([currentPosition.latitude, currentPosition.longitude]);
}