
if (!isIPad()) {
    window.debug = (function() {
        
        that = {};
        
        that.log = function (param) {
            console.log(param);
        };
        
        return that;
    })();
}

var Radio = function () {

    var cache = new LastFMCache();
    
    var metadata = "";
    
    var that = this;
    
    this.logo = "drs3.png";
    
    this.station = null;
    
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
        setTimeout("document.querySelector('#image img:last-child').setAttribute('class', '')", 10);
    };

    this.displayImageSceensaver = function (image, count, area) {
        var imgDiv = document.createElement('div');
        var img = document.createElement('img');
        var val1 = (Math.floor(Math.random() * 31) + 10)+'%';
        var val2 = (Math.floor(Math.random() * 31) + 10)+'%';
        
        img.setAttribute('src', image['#text']);
        img.setAttribute('height', '300');
        
        imgDiv.appendChild(img);
        imgDiv.setAttribute('class', 'hidden');
        imgDiv.setAttribute('id', 'img'+count);
        
        
        
        switch (area) {
          case 1:
            imgDiv.style.top = val1;
            imgDiv.style.left = val2;
            break;
          case 2:
            imgDiv.style.top = val1;
            imgDiv.style.right = val2;
            break;
          case 3:
            imgDiv.style.bottom = val1;
            imgDiv.style.left = val2;
            break;
          case 4:
            imgDiv.style.bottom = val1;
            imgDiv.style.right = val2;
            break;
        }
        
        debug.log('img['+count+']: ' +image['#text']+ ' // area: ' + area + ' ' + val1 + ':' + val2);
        
        document.getElementById("imgContainer").appendChild(imgDiv);
        setTimeout("document.querySelector('#imgContainer div#img"+count+"').setAttribute('class', '')", count);
    };
    
    this.displayBio = function (data) {
        
        bio = "";
        if (data.artist.bio.content) {
            bio = data.artist.bio.content;
        } else if (data.artist.bio.summary) {
            bio = data.artist.bio.summary;
        } else {
            return false;
        }
        
        var div = document.createElement('div');
        bio = bio.replace(/(<([^>]+)>)/ig, "").replace(/\s+$/, "");
        if (bio.length > 930) {
            bio = bio.substr(0, 930);
            bio = bio.substr(0, bio.lastIndexOf(" ")) + " …";
        }
        div.innerHTML = bio.replace(/\n/g, "<br/>");
        div.setAttribute('class', 'hidden');
        document.getElementById("artist_bio").appendChild(div);
        setTimeout("document.querySelector('#artist_bio div:last-child').setAttribute('class', '')", 10);
        
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
        //artist = 'The White Stripes'; //todo: remove
        
        var div = document.createElement('div');
        var h1 = document.createElement('h1');
        h1.innerHTML = artist;
        div.appendChild(h1);
        var h2 = document.createElement('h2');
        h2.innerHTML = 'mit ' + track;
        div.appendChild(h2);
        div.setAttribute('class', 'hidden');
        document.getElementById("title").appendChild(div);
        setTimeout("document.querySelector('#title div:last-child').setAttribute('class', '')", 10);

        // fade in last.fm
        document.querySelector("#lastfm").setAttribute('class', '');

        document.getElementById("artist").innerHTML = artist;
        document.getElementById("song").innerHTML = 'mit ' + track;

        that.lastfm.artist.getInfo({artist: artist, lang: 'de'}, {success: function (data) {

          that.displayArtist(data);

          that.lastfm.artist.getImages({artist: data.artist.name, limit: 20}, {success: function(data) {

          var found = false;

          //var container = document.getElementById('imgContainer');
          //container.innerHTML = "";

          var area = Math.floor(Math.random() * 4);

          for (i = 0; i < data.images.image.length; i++) {

            var image = data.images.image[i].sizes.size[0];

            if (!found && parseInt(image['width']) > parseInt(image['height'])) {
              that.displayImage(image);
              found = true;
          }


          if (area == 4) area = 0;
          area++;

          that.displayImageSceensaver(image, i, area);

          imgDiv.appendChild(img);

          imgDiv.style.top = Math.floor(Math.random() * 800) + "px";
          imgDiv.style.left = Math.floor(Math.random() * 400) + "px";

          container.appendChild(imgDiv);

          // fade in collage
          document.querySelector("#collage").setAttribute('class', '');
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
    
    this.searchTrackInformation = function (track, artist) {
    
        that.clear();
        
        if (track == "" && that.station != null) {
            track = that.station;
        }
        
        // avoid Last.fm problems
        track = track.replace(':', '');
        
        var params = {};
        params.track = track;
        if (artist != null) {
            artist = artist.replace(':', '');
            params.artist = artist;
        }
        
        // try track search
        that.lastfm.track.search(params, {success: function (data) {
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
        	    if (that.station != null) {
            	    var div = document.createElement('div');
            	    var h1 = document.createElement('h1');
            	    h1.innerHTML = that.station;
            	    div.appendChild(h1);
            	    var h2 = document.createElement('h2');
            	    h2.innerHTML = 'Keine Songinformationen vorhanden.';
            	    div.appendChild(h2);
            	    div.setAttribute('class', 'hidden');
            	    document.getElementById("title").appendChild(div);
            	    setTimeout("document.querySelector('#title div:last-child').setAttribute('class', '')", 10);
        	    }
        	}
        }, error: function (code, message) {
            debug.log('track.search failed: ' + message);	
        }});
    };
    
    this.onMetaDataChangeSuccess = function (data) {
        
        if (data) {
            data = data.replace(/^\s+|\s+$/g, "");
            
            that.metadata = data;
        
            var splits = data.split("-");
            if (splits[1]) {
                that.searchTrackInformation(splits[1], splits[0]);
            } else {
                splits = data.split(",");
                if (splits[1]) {
                    that.searchTrackInformation(splits[1], splits[0]);
                } else {
                    splits = data.split(".");
                    if (splits[1]) {
                        that.searchTrackInformation(splits[1], splits[0]);
                    } else {
                        that.searchTrackInformation(data, null);
                    }
                }
            }
        }
    };
    
    this.clear = function () {
    
        // fade out last.fm
        document.querySelector("#lastfm").setAttribute('class', 'hidden');
        
        // fade out collage
        document.querySelector("#collage").setAttribute('class', 'hidden');
        
        // Remove old titles
        var olds = document.querySelectorAll("#title div:not(:last-child)");
        for (i = 0; i < olds.length; i++) {
        	document.getElementById('title').removeChild(olds[i]);
        }
        
        // fade out title
        document.querySelector("#title div").setAttribute('class', 'hidden');
        
        // Remove old bios
        var olds = document.querySelectorAll("#artist_bio div:not(:last-child)");
        for (i = 0; i < olds.length; i++) {
        	document.getElementById('artist_bio').removeChild(olds[i]);
        }
        
        // fade out bio
        document.querySelector("#artist_bio div").setAttribute('class', 'hidden');
        
        // Remove old images
        var olds = document.querySelectorAll("#image img:not(:last-child)");
        for (i = 0; i < olds.length; i++) {
        	document.getElementById('image').removeChild(olds[i]);
        }
        
        // fade out image
        document.querySelector("#image img").setAttribute('class', 'hidden');
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
    }
};

var radio = null;

function onDeviceReady() {

    radio = new Radio();
	
	RA.db.init(radio); populateStations(); autoSearch()
}


function isIPad() {
    return navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i);
}

function touchMove(event) {
	// Prevent scrolling on this element
	event.preventDefault();
}

var audio = null;

function playStream(url) {
    if (isIPad()) {
        plugins.AudioStream.play(url);
    } else {
        if (audio != null) {
        	audio.pause();
        	audio = null;
        }
        audio = new Audio(url);
        audio.play();
        
        // simulate a artist
        radio.searchTrackInformation("Icky Thump", "The White Stripes");
    }
}

function playSound(url) {
    
    console.log('Playing: ' + url);
    
    if(url.match(/(m3u|pls)$/)) {
        
        var client = new XMLHttpRequest();
        
        client.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                var streams = this.responseText.match(/http:\S*/gi); 
                if(streams.length) {
                    url = streams[Math.floor(Math.random() * streams.length)];
                    playStream(url);
                }
            } else if (this.readyState == 4 && this.status != 200) {
            }
        };
        client.open("GET", url);
        debug.log('Fetching: ' + url );
        client.send();
    } else {
        playStream(url);
    }
}

function stopSound() {
    if (isIPad()) {
        plugins.AudioStream.stop();
    } else {
    	audio.pause();
    	audio = null;
    }
}

function onWinLoad() {
    if(isIPad()){
        document.addEventListener("deviceready", onDeviceReady, false);
    } else {
        onDeviceReady();
    }
}
