function init(artist)
{
  drawBackground();
  loadImages();
}
function drawBackground() {
  var ctx = document.getElementById('background').getContext('2d');

  var radgrad = ctx.createRadialGradient(400,400,0,400,400,600);
  radgrad.addColorStop(0, '#666');
  radgrad.addColorStop(1, '#000');
  
  ctx.fillStyle = radgrad;
  ctx.fillRect(0,0,1024,1024);
}


const NUMBER_OF_IMGAGES = 10;
const FADE_DURATION = 3;

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



function loadImages() {
  var container = document.getElementById('imgContainer');
  onDeviceReady();
  for (var i = 0; i < NUMBER_OF_IMGAGES; i++) 
  {
      container.appendChild(createImg());
  }
}

function createImg()
{
    var imgDiv = document.createElement('div');
    var img = document.createElement('img');
    var dur = FADE_DURATION;
    var imgData = [];
    img.setAttribute('height', '200');
		
    img.style.webkitAnimationName = 'fade';
    
    //img.src = './images/TheWhiteStripes' + i + '.jpg';
    lastfm.artist.getImages({artist: 'The White Stripes'}, {success: function(data) {
   		//for (i = 0; i <= data.images.image.length; i++) {
   		//  img.src = data.images.image[i].sizes.size[0]['#text'];
   		//alert(data.images.image[randomInteger(0,data.images.image.length)].sizes.size[0]['#text']);
   		
   		//imgData.push(data.images.image[randomInteger(0,data.images.image.length)].sizes.size[0]['#text']);
   		
   		img.src = data.images.image[randomInteger(0,data.images.image.length)].sizes.size[0]['#text'];
      
      img.style.webkitAnimationDuration = durationValue(dur);
      imgDiv.appendChild(img);
      
      //}
   		
	  }});
	
    imgDiv.style.top = pixelValue(randomInteger(0, 1024));
    imgDiv.style.left = pixelValue(randomInteger(0, 768));
    
    /*
    imgDiv.style.webkitAnimationName = 'fade';
    
    var fadeAndDropDuration = durationValue(randomFloat(5, 11));
    
    imgDiv.style.webkitAnimationDuration = fadeAndDropDuration + ', ' + fadeAndDropDuration;
    */
    
    return imgDiv;
}

window.addEventListener('load', loadImages, false);