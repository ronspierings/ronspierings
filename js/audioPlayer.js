var audioElement = document.getElementById("AudioElement");

window.addEventListener("locationInRange", onPlaySound);


async function onPlaySound(args)
{
   let sound = args.detail;

   let source = document.getElementById("AudioSourceElement");
   source.src = sound.mp3file;

   audioElement.load(); // Preload de file. Hopelijk trigger we een fetch! Update: DAT DOEN WE!
   audioElement.play(); // Speel file
}