var audioElement = document.getElementById("AudioElement")


async function playSound(url)
{
   let source = document.getElementById("AudioSourceElement");
   source.src = url;

   audioElement.load(); // Preload de file. Hopelijk trigger we een fetch! Update: DAT DOEN WE!!
   audioElement.play(); // Speel file
}