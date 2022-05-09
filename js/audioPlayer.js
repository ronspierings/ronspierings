var audioElement = document.getElementById("AudioElement");

window.addEventListener("locationInRange", onPlaySound);


async function onPlaySound(args)
{
   let sound = args.detail;

   let source = document.getElementById("AudioSourceElement");
   source.src = baseUrl + sound.mp3file;

   audioElement.load(); // Preload de file. Hopelijk trigger we een fetch! Update: DAT DOEN WE!

   try {
      audioElement.play(); // Speel file
   }
   catch(err)
   {
      alert("Fout bij afspelen media:" + err);
   }
}

/*
   Subscibe to the events
*/
audioElement.addEventListener('play', onStartPlay);
audioElement.addEventListener('pause', onStopPlay);
audioElement.addEventListener('ended', onStopPlay);
audioElement.addEventListener('timeupdate', onTimeUpdate);

// TODO: Implement buffer handling via wait event (call back to server o.i.d?)
// audioElement.addEventListner('wait', ....callback);


/*
   Event listeners
*/

function onTimeUpdate(event)
{
   // console.log("Music player onTimeUpdate", event);
   let timeToGo = audioElement.duration -  audioElement.currentTime;

   if(isNaN(timeToGo)) {
      return;
      
   }
   
   document.getElementById("txtDurationLeft").innerText = parseInt(timeToGo) + " sec";
}

function onStartPlay(event)
{
   document.getElementById("txtSound").style.color = "green";
}

function onStopPlay(event)
{
   document.getElementById("txtSound").style.color = "red";
}
