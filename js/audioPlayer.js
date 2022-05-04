var audioElement = document.getElementById("AudioElement");

window.addEventListener("locationInRange", onPlaySound);


async function onPlaySound(args)
{
   let sound = args.detail;

   let source = document.getElementById("AudioSourceElement");
   source.src = sound.mp3file;

   audioElement.load(); // Preload de file. Hopelijk trigger we een fetch! Update: DAT DOEN WE!

   try {
      audioElement.play(); // Speel file
   }
   catch(err)
   {
      alert("Fout bij afspelen media:" + err);
   }
}

audioElement.addEventListener('play', startPlay);
audioElement.addEventListener('pause', stopPlay);
audioElement.addEventListener('ended', stopPlay);


function startPlay(event)
{
   document.getElementById("txtSound").style.color = "green";
}

function stopPlay(event)
{
   document.getElementById("txtSound").style.color = "red";
}
