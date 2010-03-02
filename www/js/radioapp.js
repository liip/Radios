
function onDeviceReady()

{
    
    cache = new LastFMCache();
    /* Create a LastFM object */
    lastfm = new LastFM({
        apiKey    : 'f76b8d609c4af3988283045b8f6123ba',
        apiSecret : '3cbb48bd2736581e0c242c8a9cf3045c',
        cache     : cache
    });
    
    if(isIPad()){
        plugins.AudioStream.onMetaDataChange(function(data) {if(data) {
                var splits=data.split("-");
                document.getElementById("now_playing").innerHTML = data;
        radioapp_displayArtist(splits[0], splits[1], data);}});
        playSound();
    }
}

function touchMove(event) {
	// Prevent scrolling on this element
	event.preventDefault();
}

function playSound() {
    plugins.AudioStream.play("http://zlz-stream11.streamserver.ch/1/drs3/mp3_128");
}


function stopSound() {
    plugins.AudioStream.stop();
}

function radioapp_displayArtist(artist, song, full) {

	lastfm.track.getInfo({artist:  artist, track: song}, {success: function(data){
		
		document.getElementById("song_name").innerHTML = 'mit ' + data.track.name;
		
		lastfm.artist.getInfo({artist:  artist, lang: 'de'}, {success: function(data){
		
			document.getElementById("artist_name").innerHTML = data.artist.name;
		   	document.getElementById("artist_bio").innerHTML = data.artist.bio.summary;
		
			console.log(data.artist);
			
		   	lastfm.artist.getImages({artist: data.artist.name}, {success: function(data) {
		   		for (i = 0; i <= data.images.image.length; i++) {
		   			var image = data.images.image[i].sizes.size[0];
		   			if (image['width'] > image['height']) {
		   				document.getElementById("artist_image").src = image['#text'];
		   				break;
		   			}
		   		}
			}, error: function(code, message) {
				if(data.artist.image[4] && data.artist.image[4]['#text']) {
					document.getElementById("artist_image").src = data.artist.image[4]['#text'];
				} else {
					document.getElementById("artist_image").src = "";
				}
			}});
		}, error: function(code, message){
			// Ignore
		}});
	}, error: function(code, message){
		lastfm.track.search({artist:  artist, track: song}, {success: function(data){
			if(data.results.trackmatches.track && data.results.artistmatches.track[0]) {
				radioapp_displayArtist(data.results.artistmatches.track[0].artist, ata.results.artistmatches.track[0].name, full);
			} else {
				document.getElementById("artist_name").innerHTML = 'DRS 3';
				document.getElementById("song_name").innerHTML = full;
			}
		}});			 
	}});
	
    
	
	
    
}

function onWinLoad()
{
    if(isIPad()){
        document.addEventListener("deviceready",onDeviceReady,false);
    } else {
        onDeviceReady();
    }
    
    /*
    testEl = $('testElement');
    testEl.onmousedown = testEl.ontouchstart = startDrag;
    
    var divs = testEl.getElementsByTagName('div');
    for (var i=0;i<divs.length;i+=1) {
        divs[i].style.left = position + 'px';
        position += divs[i].offsetWidth + 10;
    }
    */
    
}

function isIPad() {
    return navigator.userAgent.match(/iPad/i) ||  navigator.userAgent.match(/iPhone/i);
}


