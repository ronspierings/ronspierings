var audioElement1 = document.getElementById("AudioElement1");
var audioElement2 = document.getElementById("AudioElement2");
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



}

function musicPlayOrPause(args)
{
   if(audioElement.paused == true)
   {
      audioElement.play();
   }
   else {
      audioElement.pause();
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

audioElement1.addEventListener('timeupdate', onTimeUpdate);
audioElement2.addEventListener('timeupdate', onTimeUpdate);


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
         element.src = undefined;

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
   let timeToGo = audioElement1.duration -  audioElement1.currentTime;

   if(isNaN(timeToGo)) {
      return;
      
   }
   
   document.getElementById("txtDurationLeft").innerText = parseInt(timeToGo) + " sec";
}

function onStartPlay(event)
{
   document.getElementById("txtSound").style.color = "green";
   document.getElementById("pauseOrPlay").disabled = false;
   document.getElementById("pauseOrPlay").innerText = "Pauzeer Audio";

}

function onStopPlay(event)
{
   document.getElementById("txtDurationLeft").innerText = "Stilte";
   document.getElementById("txtSound").style.color = "red";
   
   document.getElementById("pauseOrPlay").innerText = "Doorgaan";
}
