const NUMBER_OF_IMGAGES = 10;
const FADE_DURATION = 3;

function initScreensaver()
{
  drawBackground();
  document.getElementById('screensaver').style.visibility="visible";
}
function hideScreensaver()
{
  document.getElementById('screensaver').style.visibility="hidden";
}

function updateScreensaver(artist, track)
{
  loadImages(artist);
  loadData(artist, track);
}
function loadData(artist, track)
{
  document.getElementById("artist").innerHTML = artist;
  document.getElementById("song").innerHTML = 'mit ' + track;
	
}

function drawBackground() {
  var ctx = document.getElementById('background').getContext('2d');

  var radgrad = ctx.createRadialGradient(400,400,0,400,400,600);
  radgrad.addColorStop(0, '#666');
  radgrad.addColorStop(1, '#000');
  
  ctx.fillStyle = radgrad;
  ctx.fillRect(0,0,1024,1024);
}

function randomInteger(low, high)
{
    return low + Math.floor(Math.random() * (high - low));
}

function randomFloat(low, high)
{
    return low + Math.random() * (high - low);
}

function pixelValue(value)
{
    return value + 'px';
}

function durationValue(value)
{
    return value + 's';
}



function loadImages(artist) {
  var container = document.getElementById('imgContainer');
  container.innerHTML="";
  
    
    
    Radio.lastfm.artist.getImages(
      {artist: artist},
      {
        success: function(data) {
          for (i = 0; i < NUMBER_OF_IMGAGES; i++) {
            var imgDiv = document.createElement('div');
            var img = document.createElement('img');
            
            img.src = data.images.image[randomInteger(0,data.images.image.length)].sizes.size[0]['#text'];
            
            img.setAttribute('height', '200');
            
            img.style.webkitAnimationName = 'fade';
            img.style.webkitAnimationDuration = durationValue(FADE_DURATION);
            img.style.webkitAnimationDelay = durationValue(i * 3);
            //img.style.webkitTransform = "rotate(" + randomInteger(-10, 10) + "deg)";
            
            imgDiv.appendChild(img);
            
            imgDiv.style.top = pixelValue(randomInteger(0, 1024));
            imgDiv.style.left = pixelValue(randomInteger(0, 768));
            
            container.appendChild(imgDiv);
          }
          /*
          for (i = 0; i < data.images.image.length; i++) {
            imgData.push(data.images.image[i].sizes.size[0]['#text']);
            debug.log(imgData.length);
          }
          */
	      }
	    }
	  );
	  /*
    for (i = 0; i < NUMBER_OF_IMGAGES; i++) {
		  	img.src = imgData[randomInteger(0,imgData.length)];
        //img.style.webkitAnimationDuration = durationValue(i * FADE_DURATION);
        //debug.log(img.src);
        //debug.log(imgData[randomInteger(0,imgData.length)]);
        imgDiv.appendChild(img);
    }
	  */
    
    //return imgDiv;
}