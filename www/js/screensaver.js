const NUMBER_OF_IMGAGES = 10;
const FADE_DURATION = 3;

function initScreensaver()
{
	$('#card').toggleClass('flipped');
}

function drawBackground() {
  var ctx = document.getElementById('background').getContext('2d');

  var radgrad = ctx.createRadialGradient(400,400,0,400,400,600);
  radgrad.addColorStop(0, '#666');
  radgrad.addColorStop(1, '#000');
  
  ctx.fillStyle = radgrad;
  ctx.fillRect(0,0,1024,1024);
}
