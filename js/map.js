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
var allSoundPositions = []; // List of all the (Circles) on the map
var currentSoundIndex = -1; // The current sound index

var currentPosition = map.getCenter();
var previousSoundPosition = undefined;
var currentSoundPosition = undefined;
var nextSoundPosition = undefined;



// Layer initialiation
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
}).addTo(map);

/*
    Event Listeners
*/

map.on('accuratepositionprogress', onAccuratePositionProgress);
map.on('accuratepositionfound', onAccuratePositionFound);
map.on('accuratepositionerror', onAccuratePositionError);

map.on('locationfound', onLocationUpdate);
map.on('locationerror', notFoundLocation);

window.addEventListener("placeMarker", onPlacingMarker);
window.addEventListener("startTour", onStartTour);
window.addEventListener("placeMarkerReady", onPlaceMarkerReady);


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

function onStartTour() 
{
    // Do the GEO-location lookup (native function)
    map.locate(
        {
            watch: true, // Continously updating
            enableHighAccuracy: true
            // setView: true // Set the map?
        }
    );

    // Do the accurate Geo-location lookup
    map.findAccuratePosition({
        maxWait: 1000000,
        desiredAccuracy: 5,
    });
}

function onPlacingMarker(args)
{
    let marker = args.detail;

    // The Blue Circle (with a radius)
    let soundCirkle = L.circle(marker.latlng, {
        radius: marker.radius,
        geoData: marker
    }).addTo(map);

    // The sound icon
    let soundMarker = L.marker(marker.latlng,  {
        icon: soundMarkerIcon,     
    })
    // Bind the title permanent tooltip
    .bindTooltip("Locatie " + marker._o , {
        permanent: true,
        direction: 'right',
        opacity: 0.9,
        offset: L.point(12,-12)
    })
    .addTo(map);

    // Create a combined object (Markers and Geodata) and add to one array
    var combinedObject = {
        SoundCircle: soundCirkle,
        Marker: soundMarker,
        Geodata: args.detail
    }

    // Store this combined object in the array
    allSoundPositions.push(combinedObject);

    // Update the selfmade crappy UI
    refreshButtonPanel();
}

// All the markers are placed on the map.
function onPlaceMarkerReady()
{
    this.nextSoundPosition = allSoundPositions[0];
    allSoundPositions[0].SoundCircle.setStyle( { color: 'orange' } );
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

    // Loop through all the soundPoints currently on the map
    for(let combinedSoundPoint of allSoundPositions)
    {
        // CombinedSoundPoint Object has: Geodata, Marker and the SoundCircle 
        let soundPoint = combinedSoundPoint.Geodata;
        let soundMarker = combinedSoundPoint.Marker;
        let soundCircle = combinedSoundPoint.SoundCircle;

        let soundPointLatLng = L.latLng( soundPoint.latlng );
        let soundPointDistance = soundPointLatLng.distanceTo( lng.latlng ); // Calc the distance between us and this soundpoint
        
        // Are we within radius of the soundpoint?
        if(soundPointDistance < soundPoint.radius)
        {
            // Extra feature:
            // On start of the tour (currentSoundIndex == 0).. We should be able to "slide in" into the next sound point
            if(currentSoundIndex == -1)
            {
                //alert("Start de  sluipschut route !");
                // currentSoundIndex = soundPoint._o - 1;
            }

            // Is this soundPoint different than the current one?
            if( currentSoundIndex == -1 || currentSoundIndex != soundPoint._o )
            {
                //Extra requirement: The new SoundPosition should be the legally "next" (no trespassing!)
                if(currentSoundIndex == -1 || currentSoundIndex + 1 == soundPoint._o)
                {
                    if(currentSoundIndex == -1)
                    {
                        // CHEATMODE
                    }
                    currentSoundIndex++;
                    
                    // Determine the previous sound
                    if(currentSoundIndex > 0)
                    {
                        previousSoundPosition = allSoundPositions[currentSoundIndex - 1];
                        previousSoundPosition.SoundCircle.setStyle( { color: 'red' } );
                    }                    

                    // Determine the new current sound
                    currentSoundPosition = allSoundPositions[currentSoundIndex];

                    // Determine the new next sound (if there is a next one)
                    if(currentSoundIndex < allSoundPositions.length)
                    {
                        nextSoundPosition = allSoundPositions[currentSoundIndex + 1];

                        // Change some styling                        
                        currentSoundPosition.SoundCircle.setStyle( { color: 'green' } );
                        nextSoundPosition.SoundCircle.setStyle( { color: 'orange' } );
                    }   
                    else 
                    {
                        // TODO Send out a "done event"
                    }

                    // Send out the "I found a location" event
                    let event = new CustomEvent("playNewLocationSound", { detail: soundPoint } );
                    window.dispatchEvent(event);
                }
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
    // How far from the next position marker?
    let newDistance = 999999;
    if(nextSoundPosition != undefined && currentPosition.latlng != undefined)
    {
        let nextSoundPositionRadius = nextSoundPosition.SoundCircle.options.radius;
        let nextSoundPositionLatlng = nextSoundPosition.SoundCircle.getLatLng();

        // Calculate the distance between the current position and the "edge" of the next sound position
        newDistance = nextSoundPositionLatlng.distanceTo( currentPosition.latlng ) - nextSoundPositionRadius;
    }    

    document.querySelector("#txtDistance").innerText = newDistance.toFixed(2);
    document.querySelector("#txtAccurracy").innerText = Math.round( currentPosition.accuracy );
    document.querySelector("#txtCurrentSound").innerText = currentSoundIndex;

}

function resetCentreMap()
{
    map.setView([currentPosition.latitude, currentPosition.longitude]);
}