var Radio = function () {

    var cache = new LastFMCache();
    
    var metadata = "";
    
    var that = this;

    this.logo = "drs3.png";
    
    /* Create a LastFM object */
    this.lastfm = new LastFM({
        apiKey: 'f76b8d609c4af3988283045b8f6123ba',
        apiSecret: '3cbb48bd2736581e0c242c8a9cf3045c',
        cache: cache
    });

    
    this.displayImage = function (image) {
        var img = document.createElement('img');
        img.setAttribute('src', image['#text']);
        img.setAttribute('height', '200');
        img.setAttribute('class', 'hidden');
        document.getElementById("image").appendChild(img);
        setTimeout("document.querySelector('#image img:last-child').setAttribute('class', '')", 100);
    };
    
    this.displayBio = function (data) {
    
        if (data.artist.bio.content) {
        	document.getElementById("artist_bio").innerHTML = data.artist.bio.content.replace(/(<([^>]+)>)/ig, "").replace(/\n/g, "<br/>");
        } else if (data.artist.bio.summary) {
            document.getElementById("artist_bio").innerHTML = data.artist.bio.summary;		  
        } else {
            return false;
        }
        
        return true;
    };
    
    this.displayArtist = function (data) {
        
        if (!that.displayBio(data)) {
            // detected featuring artists
        	var artists = data.artist.name.split(/(Feat.|Ft.|\/|and|\&)/i);
        	if (artists[0] && artists[1]) {
            	that.lastfm.artist.getInfo({artist: artists[0], lang: 'de'}, {success: that.displayBio});
        	} else {
        	    // No featuring, no bio
        	}
        }
    };
    
    this.displaySongInformation = function (artist, track) {
        
        document.getElementById("artist_name").innerHTML = artist;
		document.getElementById("song_name").innerHTML = 'mit ' + track;
		
        document.getElementById("artist").innerHTML = artist;
        document.getElementById("song").innerHTML = 'mit ' + track;
		
		that.lastfm.artist.getInfo({artist: artist, lang: 'de'}, {success: function (data) {
		    
			that.displayArtist(data);
			
		   	that.lastfm.artist.getImages({artist: data.artist.name, limit: 5}, {success: function(data) {
		   	    
		   		var found = false;
		   		
		   		var container = document.getElementById('imgContainer');
		   		container.innerHTML = "";
		   		
		   		for (i = 0; i < data.images.image.length; i++) {
		   			
		   			var image = data.images.image[i].sizes.size[0];
		   			
		   			if (!found && parseInt(image['width']) > parseInt(image['height'])) {
		   				that.displayImage(image);
		   				found = true;
		   			}
                    
                    var imgDiv = document.createElement('div');
                    var img = document.createElement('img');
                    
                    img.src = image['#text'];
                    
                    img.setAttribute('height', '300');
                    
                    img.style.webkitAnimationName = 'fade';
                    img.style.webkitAnimationDuration = 3 + "s";
                    img.style.webkitAnimationDelay = (i * 3) + "s";
                    //img.style.webkitTransform = "rotate(" + Math.floor(Math.random() * 10) + "deg)";
                    
                    imgDiv.appendChild(img);
                    
                    imgDiv.style.top = Math.floor(Math.random() * 800) + "px";
                    imgDiv.style.left = Math.floor(Math.random() * 400) + "px";
                    
                    container.appendChild(imgDiv);
		   		}
		   		
		   		// if no widescreen image wass found, try first one instead
		   		if(!found && data.images.image[0] && data.images.image[0].sizes.size[0] && data.images.image[0].sizes.size[0]['#text']) {
		   		    image = data.images.image[0].sizes.size[0];
		   			that.displayImage(image);
		   		} else if (!found && data.images.image && data.images.image.sizes.size[0] && data.images.image.sizes.size[0]['#text']) {
		   		    // only one image
	   		        image = data.images.image.sizes.size[0];
	   		    	that.displayImage(image);
		   		}
			}});
		}, error: function(code, message){
		    debug.log('artist.getInfo failed: ' + message);	
		}});
    };
    
    this.searchTrackInformation = function (artist, track) {
        
        artist = artist.replace(':', '');
        track = track.replace(':', '');
        
        // try track search
        that.lastfm.track.search({artist: artist, track: track}, {success: function (data) {
            debug.log(artist);
            debug.log(track);
        	if (data.results.trackmatches.track) {
        	    if (data.results.trackmatches.track[0]) {
        		    that.displaySongInformation(data.results.trackmatches.track[0].artist, data.results.trackmatches.track[0].name);
        		} else {
        		    that.displaySongInformation(data.results.trackmatches.track.artist, data.results.trackmatches.track.name);
        		}
        	} else {
        	
        	    // no track found
        		document.getElementById("artist_name").innerHTML = artist;
        		document.getElementById("song_name").innerHTML = track;
        						
        		var img = document.createElement('img');
        		img.setAttribute('src', 'images/' + that.logo);
        		img.setAttribute('height', '200');
        		img.setAttribute('class', 'hidden');
        		document.getElementById("image").appendChild(img);
        		setTimeout("document.querySelector('#image img:last-child').setAttribute('class', '')", 100);
        	}
        }, error: function (code, message) {
            debug.log('track.search failed: ' + message);	
        }});
    };
    
    this.parseMetadata = function (data) {
        
        metadata = data;
        
        var splits = data.split("-");
        if (splits[1]) {
            that.searchTrackInformation(splits[0], splits[1]);
        } else {
            splits = data.split(",");
            if (splits[1]) {
                that.searchTrackInformation(splits[0], splits[1]);
            } else {
                splits = data.split(".");
                if (splits[1]) {
                    that.searchTrackInformation(splits[0], splits[1]);
                } else {
                    // can't split artist and track
                	document.getElementById("artist_name").innerHTML = data;
                					
                	var img = document.createElement('img');
                	img.setAttribute('src', 'images/drs3.png');
                	img.setAttribute('height', '200');
                	img.setAttribute('class', 'hidden');
                	document.getElementById("image").appendChild(img);
                	setTimeout("document.querySelector('#image img:last-child').setAttribute('class', '')", 100);
                }
            }
        }
    };
    
    this.onMetaDataChangeSuccess = function (data) {
        
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
            
            that.parseMetadata(data);
        }
    };
    
    if (isIPad()) {
        plugins.AudioStream.onMetaDataChange(this.onMetaDataChangeSuccess, null, null);
        
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
	playSound();
};

var radio = null;
var radioDb = null;

function onDeviceReady() {

    radio = new Radio();

    radioDb = new RadioDb();
    radioDb.init();
    radioDb.populateStations();
    radioDb.autoSearch();
}


function isIPad() {
    return navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i);
}

function touchMove(event) {
	// Prevent scrolling on this element
	// event.preventDefault();
}

function playFromPlaylist(url) {
  var client = new XMLHttpRequest();
  
  client.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      var streams = this.responseText.match(/http:\S*/gi); 
      if( streams.length ) 
        playSound(streams[Math.floor(Math.random()*streams.length)]);
    } else if (this.readyState == 4 && this.status != 200) {
        alert('Playlist nicht erreichbar (' + this.status + ')');
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
    if(isIPad()){
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


