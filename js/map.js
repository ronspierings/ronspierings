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
var thuisLatLng = [51.7078039375618, 5.30087411629549];



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
        radius: marker.radius
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

    for(let soundPoint of soundPoints)
    {
        let soundPointLatLng = L.latLng(soundPoint.latlng);
        let soundPointDistance = soundPointLatLng.distanceTo( lng.latlng );

        if(soundPointDistance < soundPoint.radius)
        {
            // We have hit the jackpot :D
            let event = new CustomEvent("locationInRange", { detail: soundPoint } );
            window.dispatchEvent(event);
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
    // Hoe ver van huis?
    let newDistance = thuis.getLatLng().distanceTo( currentPosition.latlng);

    document.querySelector("#txtDistance").innerText = newDistance.toFixed(2);
    document.querySelector("#txtAccurracy").innerText = Math.round( currentPosition.accuracy );

}

function resetCentreMap()
{
    map.setView([currentPosition.latitude, currentPosition.longitude]);
}

function createMarker(options)
{
    var marker = L.marker([options.latitude, options.longitude]).addTo(map);
}


// Get the distance between 2 latlng
function distance(latlng1, latlng2) {
    var lat1 = latlng1.lat;
    var lat2 = latlng2.lat;
    var lon1 = latlng1.lng;
    var lon2 = latlng2.lng;

    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  
    return 12742 * Math.asin(Math.sqrt(a)) * 1000; // 2 * R; R = 6371 km
}