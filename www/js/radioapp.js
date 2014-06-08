
//if (!isIDevice()) {
    window.debug = (function() {

        that = {};

        that.log = function (param) {
            console.log(param);
        };

        return that;
    })();
//}

var Radio = function () {

    var cache = new LastFMCache();

    var metadata = "";

    var that = this;

    this.done = false;

    this.logo = "drs3.png";

    this.station = null;

    var iscroll = new iScroll('scroll');
    /* Create a LastFM object */
    this.lastfm = new LastFM({
        apiKey: 'f76b8d609c4af3988283045b8f6123ba',
        apiSecret: '3cbb48bd2736581e0c242c8a9cf3045c',
        cache: cache
    });

    this.displayImage = function (image) {
        var img = document.createElement('img');
        img.setAttribute('src', image['#text']);
        if (image['height'] > 200) {
            img.setAttribute('height', '200');
        }
        img.setAttribute('class', 'hidden');
        document.getElementById("image").appendChild(img);
        setTimeout("document.querySelector('#image img:last-child').setAttribute('class', '')", 10);
    };

    this.displayImageSceensaver = function (image, count, area) {
        var imgDiv = document.createElement('div');
        var img = document.createElement('img');
        var val1 = (Math.floor(Math.random() * 31) + 2)+'%';
        var val2 = (Math.floor(Math.random() * 11) + 1)+'%';

        img.setAttribute('src', image['#text']);
        if (image['height'] > 300) {
            img.setAttribute('height', '300');
        }
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
        setTimeout("document.querySelector('#imgContainer div#img"+count+"').setAttribute('class', '')", (count * 5) * 1000);
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
        /*if (bio.length > 930) {
            bio = bio.substr(0, 930);
            bio = bio.substr(0, bio.lastIndexOf(" ")) + " …";
        }*/
        if (language == 'fr') {
            div.innerHTML = '<p>' + bio.replace(/\n/g, "<br/>") + '<p class="lastfm" class="hidden"><br/>D\'information sur l\'artiste de <img src="images/lastfm.png" alt="Last.fm" height="18"/>.</p>';
        } else {
            div.innerHTML = '<p>' + bio.replace(/\n/g, "<br/>") + '<p class="lastfm" class="hidden"><br/>Künstlerinformationen von <img src="images/lastfm.png" alt="Last.fm" height="18"/>.</p>';
        }
        document.getElementById("artist_bio").appendChild(div);
        iscroll.refresh();

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

    this.scrollingSongInfo = null;
    this.displayIPhoneSongInfo = function(info) {
        if (isIPhone()) {
            if (isIPhone5()) {
                document.querySelector("#stations").style.height = "416px";
            } else {
                document.querySelector("#stations").style.height = "328px";
            }
            document.querySelector("#artistsong").style.display = 'block';
            document.querySelector("#artistsong").innerHTML = info.substr(0,100);
            if (!this.scrollingSongInfo) {
                this.scrollingSongInfo = new iScroll('artistsonginfo');
            }
            this.scrollingSongInfo.refresh();
            this.scrollingSongInfo.scrollTo(0,0);

        }

        plugins.AudioStream.setNowPlaying(info, radio.station);

    };

    this.displaySongInformation = function (artist, track) {
        //artist = 'The White Stripes'; //todo: remove

        radio.clear();

        var div = document.createElement('div');
        var h1 = document.createElement('h1');
        h1.innerHTML = artist;
        div.appendChild(h1);
        var h2 = document.createElement('h2');
        if (language == 'fr') {
            h2.innerHTML = 'avec ' + track;
        } else {
            h2.innerHTML = 'mit ' + track;
        }
        div.appendChild(h2);
        div.setAttribute('class', 'hidden');
        document.getElementById("title").appendChild(div);
        setTimeout("document.querySelector('#title div:last-child').setAttribute('class', '')", 10);

        // fade in last.fm
        //document.querySelector("#lastfm").setAttribute('class', '');

        document.getElementById("station_name").innerHTML = that.station;
        document.getElementById("artist").innerHTML = artist;
        if (language == 'fr') {
            document.getElementById("song").innerHTML = 'avec ' + track;
        } else {
            document.getElementById("song").innerHTML = 'mit ' + track;
        }


        this.displayIPhoneSongInfo(artist + " - " + track);
        that.lastfm.artist.getInfo(
        {artist: artist, lang: language},
        {success: function (data) {

                if (!isIPhone()) {
                    that.displayArtist(data);
                }
                that.lastfm.artist.getImages(
                {artist: data.artist.name, limit: 20},
                {success: function(data) {
                        that.lastfmdata = data;
                        if (data.images.image.length > 0) {
                            document.querySelector("#collage").setAttribute('class', '');
                        }
                        if (!isIPhone() || document.getElementById('card').getAttribute('class') == 'flipped') {
                            that.displayImages(data);
                        }

                }
                }
                )
        }
        , error: function(code, message) {
            debug.log('artist.getInfo failed: ' + message);
        }
        }
        );
    };
    this.displayImages = function(data) {
        var found = false;
        var area = Math.floor(Math.random() * 4);
        for (i = 0; i < data.images.image.length; i++) {
            var sizes = data.images.image[i].sizes.size;
            var image = null;
            if (isIPhone() && sizes[5]) {
                image = sizes[5];
            } else {
                image = sizes[0];
            }

            if (!found && parseInt(image['width']) > parseInt(image['height'])) {
                that.displayImage(image);
                found = true;
            }


            if (area == 4) area = 0;
            area++;

            if (i <= 6) {
                if ( document.getElementById('card').getAttribute('class') == 'flipped') {
                    that.displayImageSceensaver(image, i, area);
                }
            }

            // fade in collage
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
    };

    this.noTrack = function (force, datatext) {
        if ((!that.done || force) && that.station != null) {
            that.clear();
            var div = document.createElement('div');
            var h1 = document.createElement('h1');
            h1.innerHTML = that.station;
            div.appendChild(h1);
            var h2 = document.createElement('h2');
            if (datatext) {
                h2.innerHTML = datatext;
            } else if (language == 'fr') {
                h2.innerHTML = 'Pas d\'information sur l\'artiste';

            } else {
                h2.innerHTML = 'Keine Künstlerinformationen vorhanden';

            }
            that.displayIPhoneSongInfo(h2.innerHTML) ;
            h2.setAttribute('class', 'notrack');
            div.appendChild(h2);
            //div.setAttribute('class', 'hidden');
            document.getElementById("title").appendChild(div);
            //setTimeout("document.querySelector('#title div:last-child').setAttribute('class', '')", 10);

            that.done = true;
        }
    };

    this.searchTrackInformation = function (track, artist) {

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
                debug.log("Artist: " + artist);
                debug.log("Track: " + track);
                if (data.results.trackmatches.track) {

                    that.done = false;
                    if (data.results.trackmatches.track[0]) {
                        that.displaySongInformation(data.results.trackmatches.track[0].artist, data.results.trackmatches.track[0].name);
                    } else {
                        that.displaySongInformation(data.results.trackmatches.track.artist, data.results.trackmatches.track.name);
                    }
                } else {
                    // no track found
                    if (that.metadata) {
                        that.noTrack(true, that.metadata);
                    } else {
                        that.noTrack();
                    }
                }
        }, error: function (code, message) {
            debug.log('track.search failed: ' + message);
        }});
    };

    this.onMetaDataChangeSuccess = function (data) {
        //data = 'Muse - Undisclosed Desires';
        //data = 'The White Stripes - Icky Thump';
        //data = 'The Raconteurs - Salute Your Solution';
        //data = 'The Subways - Kalifornia';
        //data = 'Band of Skulls - I Know What I Am';
        //data = 'Mando Diao - Gloria';
        //data = 'Melanie Fiona - Monday Morning';
        that.lastfmdata = null;
        if (data) {
            data = data.replace(/^\s+|\s+$/g, "");

            // blame energy zurich
            if (data == "System - Mic Off" || data == "System - Mic On" ) {
                data = "";
            }

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
                        that.noTrack(true,that.metadata);
                    }
                }
            }
        }
    };

    this.clear = function () {

        // fade out last.fm
        //document.querySelector("#lastfm").setAttribute('class', 'hidden');

        // fade out collage
        document.querySelector("#collage").setAttribute('class', 'hidden');

        // Remove old titles
        var olds = document.querySelectorAll("#title div");
        for (i = 0; i < olds.length; i++) {
            document.getElementById('title').removeChild(olds[i]);
        }

        // fade out title
        //document.querySelector("#title div").setAttribute('class', 'hidden');

        // Remove old bios
        var olds = document.querySelectorAll("#artist_bio div");
        for (i = 0; i < olds.length; i++) {
            document.getElementById('artist_bio').removeChild(olds[i]);
        }

        // Remove old images
        var olds = document.querySelectorAll("#image img");
        for (i = 0; i < olds.length; i++) {
            document.getElementById('image').removeChild(olds[i]);
        }

        // fade out image
        //document.querySelector("#image img").setAttribute('class', 'hidden');

        // Remove old xco images
        var olds = document.querySelectorAll("#imgContainer div");
        for (i = 0; i < olds.length; i++) {
            document.getElementById('imgContainer').removeChild(olds[i]);
        }
        //xc.refresh();
        iscroll.scrollTo(0, 0, '0');
    };

    if (isIDevice()) {

        plugins.AudioStream.onMetaDataChange(this.onMetaDataChangeSuccess, null, null);

        if (plugins.AudioStream.onStatusChange) {

            plugins.AudioStream.onStatusChange(function(status) {
                debug.log("STATUS " + status);
                if(status == 'isPlaying') {
                    // document.getElementById('now_station').innerHTML = 'Now Playing DRS 3: ';
                } else if (status == 'isStopping') {
                    if (isIPhone()) {
                        document.querySelector("#artistsong").innerHTML = 'Stopped';
                    }
                }else if (status == 'isLoading') {
                    if (isIPhone()) {
                        document.querySelector("#artistsong").innerHTML = 'Loading ... ';
                    }
                }
            });
        }
    }
};

var radio = null;
var radioDb = null;
var language = 'de';

function lang(lang) {
    language = lang.value;
}

function onDeviceReady() {
    if(isIDevice()){

        navigator.globalization.getPreferredLanguage(lang, null);
        testReachable_callback();
    } else {
        init();
    }
}

function testReachable_callback(reachability) {
    // FIXME use events for detecting network changes
    //navigator.network.updateReachability(reachability);
    if (navigator.connection.type !== Connection.NONE) {
        init();
    } else {
        if (language == 'fr') {
            alert("Une connexion internet est requise.");
        } else {
            alert("Es wird eine Internetverbinung benötigt.");
        }
    }
}

function init() {
    try {
        radio = new Radio();
   radioDb = new RadioDb();
    radioDb.init();
    radioDb.populateStations();
    //radioDb.autoSearch();
    radioDb.getLastListenedStation(function(station) {
        // if we listened to a station previously, start it again
        if(station && station.listened_at) {
            document.getElementById('station-'+station.id).onclick();
        }
    });
    window.setTimeout(function() {
        var scr = new iScroll('scrollStations');
        scr.refresh();
    },1000);
  } catch (e) {
        console.log(e);
    }

}


function isIDevice() {
    return navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i);
}

function isIPhone() {
    return screen.availHeight < 549;
}

function isIPhone5() {
    return screen.availHeight == 548;
}

function touchMove(event) {
    // Prevent scrolling on this element
    event.preventDefault();
}



var audio = null;
var confirmedNonWlan = false;

function playStream(url) {
    if (isIDevice()) {
        document.getElementById("mute").setAttribute('class', '');
        plugins.AudioStream.play(url);
        if (radio.playingEl) {
            radio.playingEl.appendChild(radio.playing);
        }
        radio.displayIPhoneSongInfo("Loading ...");
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
    if (radio && radio.station) {
        track(radio.station);
    }
    
}

function playSound(url) {
    debug.log("playSound " + plugins.AudioStream.getStatus() );
    if (plugins.AudioStream.getStatus() == 'isPlaying') {
        stopSound();
    }
    debug.log('Playing: ' + url);
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
                alert('Playlist nicht erreichbar (' + this.status + ')');
            }
        };
        client.open("GET", url);
        debug.log('Fetching: ' + url );
        client.send();
    } else {
        playStream(url);
    }
    return true;
}

function stopSound() {

    if (isIDevice()) {

        if (plugins.AudioStream.getStatus() == 'isPlaying') {
            document.getElementById("mute").setAttribute('class', 'muted');
            if (radio.playing.parentNode) {
                radio.playing.parentNode.removeChild(radio.playing);
            }
            plugins.AudioStream.stop();
        }
    } else {
        audio.pause();
        audio = null;
    }

}

function track(name) {
    var clientLog = new XMLHttpRequest();
//    clientLog.onreadystatechange = function() {console.log("READY STATE CHANGE " + this.readyState + " " + this.status)};
    var url = 'http://radios.liip.ch/station/' + name.replace(/ /gi,'_') + '.html?d=' + new Date();
    clientLog.open("GET", url);
    clientLog.send();
}

function toggleSound() {
    if (plugins.AudioStream.getStatus() != 'isPlaying' && radio.stream) {
        return playSound(radio.stream);
    } else {
        return stopSound();

    }
}




function onWinLoad() {
    if(isIDevice()){
        document.addEventListener("deviceready", onDeviceReady, false);
    } else {
        onDeviceReady();
    }
}
