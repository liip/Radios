var Radio = function () {

    var cache = new LastFMCache();
    
    var metadata = "";
    
    function displayImage(image) {
        var img = document.createElement('img');
        img.setAttribute('src', image['#text']);
        img.setAttribute('height', '200');
        img.setAttribute('class', 'hidden');
        document.getElementById("image").appendChild(img);
        setTimeout("document.querySelector('#image img:last-child').setAttribute('class', '')", 100);
    }
    
    function displayBio(data) {
    
        if (data.artist.bio.content) {
        	document.getElementById("artist_bio").innerHTML = data.artist.bio.content.replace(/(<([^>]+)>)/ig, "").replace(/\n/g, "<br/>");
        } else if (data.artist.bio.summary) {
            document.getElementById("artist_bio").innerHTML = data.artist.bio.summary;		  
        } else {
            return false;
        }
        
        return true;
    }
    
    function displayArtist(data) {
        
        if (!displayBio(data)) {
            // detected featuring artists
        	var artists = data.artist.name.split(/(Feat.|Ft.|\/|and|\&)/i);
        	if (artists[0] && artists[1]) {
            	Radio.lastfm.artist.getInfo({artist: artists[0], lang: 'de'}, {success: displayBio});
        	} else {
        	    // No featuring, no bio
        	}
        }
    }
    
    function displaySongInformation(artist, track) {
        
        updateScreensaver(artist, track);
        
        document.getElementById("artist_name").innerHTML = artist;
		document.getElementById("song_name").innerHTML = 'mit ' + track;
		
		Radio.lastfm.artist.getInfo({artist: artist, lang: 'de'}, {success: function (data){
		    
			displayArtist(data);
			
		   	Radio.lastfm.artist.getImages({artist: data.artist.name}, {success: function(data) {
		   	    
		   		var found = false;
		   		
		   		for (i = 0; i < data.images.image.length; i++) {
		   			var image = data.images.image[i].sizes.size[0];
		   			if (parseInt(image['width']) > parseInt(image['height'])) {
		   				displayImage(image);
		   				found = true;
		   				break;
		   			}
		   		}
		   		
		   		// if no widescreen image wass found, try first one instead
		   		if(!found && data.images.image[0] && data.images.image[0].sizes.size[0] && data.images.image[0].sizes.size[0]['#text']) {
		   		    image = data.images.image[0].sizes.size[0];
		   			displayImage(image);
		   		} else if (!found && data.images.image && data.images.image.sizes.size[0] && data.images.image.sizes.size[0]['#text']) {
		   		    // only one image
	   		        image = data.images.image.sizes.size[0];
	   		    	displayImage(image);
		   		}
			}});
		}, error: function(code, message){
		    debug.log('artist.getInfo failed: ' + message);	
		}});
    }
    
    function searchTrackInformation(artist, track) {
        
        // try track search
        Radio.lastfm.track.search({artist: artist, track: track}, {success: function (data) {
            
        	if (data.results.trackmatches.track) {
        	    if (data.results.trackmatches.track[0]) {
        		    displaySongInformation(data.results.trackmatches.track[0].artist, data.results.trackmatches.track[0].name);
        		} else {
        		    displaySongInformation(data.results.trackmatches.track.artist, data.results.trackmatches.track.name);
        		}
        	} else {
        	
        	    // no track found
        		document.getElementById("artist_name").innerHTML = artist;
        		document.getElementById("song_name").innerHTML = track;
        						
        		var img = document.createElement('img');
        		img.setAttribute('src', 'images/drs3.png');
        		img.setAttribute('height', '200');
        		img.setAttribute('class', 'hidden');
        		document.getElementById("image").appendChild(img);
        		setTimeout("document.querySelector('#image img:last-child').setAttribute('class', '')", 100);
        	}
        }, error: function (code, message) {
            debug.log('track.search failed: ' + message);	
        }});
    }
    
    function parseMetadata(data) {
        
        metadata = data;
        
        var splits = data.split("-");
        if (splits[1]) {
            searchTrackInformation(splits[0], splits[1]);
        } else {
            splits = data.split(",");
            if (splits[1]) {
                searchTrackInformation(splits[0], splits[1]);
            } else {
                splits = data.split(".");
                if (splits[1]) {
                    searchTrackInformation(splits[0], splits[1]);
                }
            }
        }
    }
    
    function onMetaDataChangeSuccess(data) {
        
        if (data) {
            
            // clear display
            document.getElementById("artist_name").innerHTML = "";
            document.getElementById("song_name").innerHTML = "";
            document.getElementById("artist_bio").innerHTML = "";
            
            // Remove old images
            var olds = document.querySelectorAll("#image img:not(:last-child)");
            for (i = 0; i < olds.length; i++) {
            	document.getElementById('image').removeChild(olds[i]);
            }
            
            // fade out image
            document.querySelector("#image img").setAttribute('class', 'hidden');
            
            parseMetadata(data);
        }
    }
    
    return {
        
        lastfm: null,
        
        init: function () {
            
            /* Create a LastFM object */
            this.lastfm = new LastFM({
                apiKey: 'f76b8d609c4af3988283045b8f6123ba',
                apiSecret: '3cbb48bd2736581e0c242c8a9cf3045c',
                cache: cache
            });
            
            if (this.isIPad()) {
                plugins.AudioStream.onMetaDataChange(onMetaDataChangeSuccess, null, null);
                
                if (plugins.AudioStream.onStatusChange) {
                    
                    plugins.AudioStream.onStatusChange(function(status) {
                        if(status == 'isPlaying') {
                            // document.getElementById('now_station').innerHTML = 'Now Playing DRS 3: ';
                        } else {
                            // document.getElementById('now_station').innerHTML = 'Stopped. ';
                        }
                    });
                }
                
                playSound();
            }
        },
        
        isIPad: function () {
            return true;
            return navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i);
        }
    };
}();


function onDeviceReady() {

    Radio.init();
}


function touchMove(event) {
	// Prevent scrolling on this element
	// event.preventDefault();
}

function playFromPlaylist(url) {
  var client = new XMLHttpRequest();
  
  client.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      // TODO make sure the matches aren't recognized as playlists in playSound() (otherwise endless loop)
      var streams = this.responseText.match(/http:\S*/gi); 
      if( streams.length ) 
        playSound(streams[Math.floor(Math.random()*streams.length)]);
    } else if (this.readyState == 4 && this.status != 200) {
    }
  };
  client.open("GET", url);
  debug.log('Fetching: ' + url );
  client.send();
}

function playSound(url) {
    url = url || "http://zlz-stream11.streamserver.ch/1/drs3/mp3_128";
    debug.log('Playing: ' + url);
    if( url.match(/(m3u|pls)$/) ) {
        playFromPlaylist(url);
    } else {
        plugins.AudioStream.play(url);
    }
}

function stopSound() {
    plugins.AudioStream.stop();
}



function onWinLoad() {
    if(Radio.isIPad()){
        document.addEventListener("deviceready", onDeviceReady, false);
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


