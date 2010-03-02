function drawBackground() {
  var ctx = document.getElementById('background').getContext('2d');

  var radgrad = ctx.createRadialGradient(300,300,0,300,300,600);
  radgrad.addColorStop(0, '#666');
  radgrad.addColorStop(1, '#000');
  
  ctx.fillStyle = radgrad;
  ctx.fillRect(0,0,1024,768);
}



const NUMBER_OF_IMGAGES = 6;


/*
   Receives the lowest and highest values of a range and
   returns a random float that falls within that range.
*/
function randomFloat(low, high)
{
    return low + Math.random() * (high - low);
}


/*
    Receives a number and returns its CSS pixel value.
*/
function pixelValue(value)
{
    return value + 'px';
}


/*
    Returns a duration value for the falling animation.
*/

function durationValue(value)
{
    return value + 's';
}


function init() {
  var container = document.getElementById('imgContainer');
  
  for (var i = 0; i < NUMBER_OF_IMGAGES; i++) 
  {
      container.appendChild(createImg());
  }
}

function createImg()
{
    /* Start by creating a wrapper div, and an empty img element */
    var imgDiv = document.createElement('div');
    var image = document.createElement('img');
    
    /* Randomly choose a leaf image and assign it to the newly created element */
    image.src = 'images/TheWhiteStripes' + randomInteger(1, NUMBER_OF_IMGAGES) + '.jpg';
    
    /* Position the leaf at a random location within the screen */
    imgDiv.style.top = pixelValue(randomInteger(-150, -50));
    imgDiv.style.left = pixelValue(randomInteger(0, 500));
    
    /* Randomly choose a spin animation */
    //var spinAnimationName = (Math.random() < 0.5) ? 'clockwiseSpin' : 'counterclockwiseSpinAndFlip';
    
    /* Set the -webkit-animation-name property with these values */
    imgDiv.style.webkitAnimationName = 'fade, drop';
    image.style.webkitAnimationName = spinAnimationName;
    
    /* Figure out a random duration for the fade and drop animations */
    var fadeAndDropDuration = durationValue(randomFloat(5, 11));
    
    /* Figure out another random duration for the spin animation */
   // var spinDuration = durationValue(randomFloat(4, 8));
    /* Set the -webkit-animation-duration property with these values */
    imgDiv.style.webkitAnimationDuration = fadeAndDropDuration + ', ' + fadeAndDropDuration;
    //image.style.webkitAnimationDuration = spinDuration;

    /* Add the created image to the div */
    imgDiv.appendChild(image);

    /* Return this div so it can be added to the document */
    return imgDiv;
}

window.addEventListener('load', init, false);