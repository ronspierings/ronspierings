var audioElement1 = document.getElementById("AudioElement1");
var audioElement2 = document.getElementById("AudioElement2");

var currentAudioElement = document.getElementById("AudioElement1");

var fadeoutSeconds = 10;


async function onPlaySound(args)
{
   let sound = args.detail;

   // Determine the free Audio track.
   let audioElement = undefined;
   if(audioElement1.paused == true)
   {
      // Pick AudioElement1 as a free and playable soundelement
      audioElement = audioElement1;
   }
   else if(audioElement2.paused == true)
   {
      // Pick AudioElement2 as a free and playable soundelement
      audioElement = audioElement2;
   }
   else 
   {
      // No free audio track? Force use audioElement1....
      audioElement = audioElement1;
   }

   // Set the current audioElement
   currentAudioElement = audioElement;

   currentAudioElement.addEventListener('timeupdate', onTimeUpdate);

   // Do we need to fadeout a currently playing audio?
   if(audioElement1. paused == false || audioElement2.paused == false)
   {
      // Which one to fadeout??
      if(audioElement1.paused == false)
      {
         fadeOutAudioElement(audioElement1, fadeoutSeconds);
      }
      if(audioElement2.paused == false)
      {
         fadeOutAudioElement(audioElement2, fadeoutSeconds);
      }
   }

   audioElement.src = baseUrl + sound.mp3file;

   try {
      audioElement.load(); // Preload the file. This triggers the OnPlayThrough event when all ready.
   }
   catch(err)
   {
      alert("Fout bij afspelen audio. Contacteer de beheerder");
   }

   // Update the UI
   onStartPlay();
}

function musicPlayOrPause(args)
{
   if(currentAudioElement.paused == true)
   {
      currentAudioElement.play();
      onStartPlay();
   }
   else {
      currentAudioElement.pause();
      onStopPlay();
   }   
}

/*
   Subscibe to the events
*/
window.addEventListener("playNewLocationSound", onPlaySound);

// Let this audioelement listen to events:
/*
audioElement.addEventListener('play', onStartPlay);
audioElement.addEventListener('pause', onStopPlay);
audioElement.addEventListener('ended', onStopPlay);
*/
audioElement1.addEventListener('canplaythrough', () => { audioElement1.play() });
audioElement2.addEventListener('canplaythrough', () => { audioElement2.play() });


// TODO: Implement buffer handling via wait event (call back to server o.i.d?)
// audioElement.addEventListner('wait', ....callback);

/*
   Helper functions
*/
function fadeOutAudioElement(element, secAmount)
{
   console.log("Fadeout event:", element.src);
   // Run every 1000 MS
   let intervalId = setInterval( (element, secAmount) => {

      // Is the fadeout done?
      if(element.volume <= 0.1)
      {
         element.pause();
         element.volume = 1;

         clearInterval(intervalId);
         return;
      }

      element.volume = element.volume - 0.1;
   }, 1000, element, secAmount);
}


/*
   Event listeners
*/

function onTimeUpdate(event)
{
   let timeToGo = currentAudioElement.duration -  currentAudioElement.currentTime;

   if(isNaN(timeToGo)) {
      return;
      
   }
   
   document.getElementById("txtDurationLeft").innerText = parseInt(timeToGo) + " sec";
}

function onStartPlay()
{
   document.getElementById("txtSound").style.color = "green";
   document.getElementById("pauseOrPlay").disabled = false;
   document.getElementById("pauseOrPlay").innerText = "Pauzeer Audio";

}

function onStopPlay()
{
   document.getElementById("txtDurationLeft").innerText = "Stilte";
   document.getElementById("txtSound").style.color = "red";
   
   document.getElementById("pauseOrPlay").innerText = "Doorgaan";
}
