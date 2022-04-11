/*import '../css/leaflet.css';
import 'leaflet';

// import images
import '../images/marker-icon-2x.png';
import imgLocation from '../images/location.png';
import imgPlay from '../images/play.png';
import imgMarker from '../images/marker-icon-2x.png';
*/

var imgLocation = 'images/location.png';
var imgPlay = 'images/play.png';
var imgMarker = 'images/marker-icon-2x.png';

var jsondata = fetch('js/geo-data.json')
.then( response => {
    jsondata = response.json();
    console.log(jsondata);
    return jsondata;
});


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
var thuisLatLng = [51.707796589958875, 5.300826064610947];
var sound1LatLng = [51.707996589958875, 5.300826064910947];
var soundMarkerList = [];


// Layer initialiation
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Do the GEO-location lookup (native function)
map.locate(
    {
        watch: true, // Continously updating
        // setView: true // Set the map?
    }
);

// Do the accurate Geo-location lookup
map.findAccuratePosition({
    maxWait: 10000,
    desiredAccuracy: 15
});

/*
    Event Listeners
*/

map.on('accuratepositionprogress', onAccuratePositionProgress);
map.on('accuratepositionfound', onAccuratePositionFound);
map.on('accuratepositionerror', onAccuratePositionError);

map.on('locationfound', onLocationUpdate);
map.on('locationerror', notFoundLocation);


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


var thuis = L.marker([51.707796589958875, 5.300826064610947],
{
    icon: regularMarkerIcon,
    iconSize: [24,24]
}).addTo(map);

// Test sound marker 1
var soundCirle1 = L.circle(sound1LatLng, {
    radius: 7.5
}).addTo(map);

var soundMarker1 = L.marker(sound1LatLng,  {
    icon: soundMarkerIcon,     
}).addTo(map);


/*
    Event Functions (Listner functions)
*/

function onAccuratePositionError (e) 
{
    console.log("Error:");
    console.log(e);
    refreshButtonPanel();
}

function onAccuratePositionProgress (latlng) 
{
    currentPosition = latlng;
    console.log("Accurate busy:");
    console.log(latlng);

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

    var sound1LatLng = soundCirle1.getLatLng();
    var distanceTo = sound1LatLng.distanceTo(lng.latlng);
    if(distanceTo < soundCirle1.getRadius())
    {
        
        alert("Speel geluid!");
    }

    // Refresh our lovely UI
    refreshButtonPanel();    
}

function notFoundLocation(e)
{
    alert("GPS Locatie niet gevonden");
    console.log(e);
}


/*
    Helper Functions
*/
function refreshButtonPanel() 
{
    // Hoe ver van huis?
    var newDistance = soundCirle1.getLatLng().distanceTo( currentPosition.latlng);

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