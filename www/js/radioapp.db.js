/* http://developer.apple.com/safari/library/documentation/iPhone/Conceptual/SafariJSDatabaseGuide/UsingtheJavascriptDatabase/UsingtheJavascriptDatabase.html */

function Migrator(db) {
    var migrations = [];
    var doReload = false;
    this.migration = function(number, func){
        migrations[number] = func;
    };
    var doMigration = function(number){
        if(migrations[number]){
            doReload = true;
            db.changeVersion(db.version, String(number), function(t){
                migrations[number](t);
            }, function(err){
                debug.log('DB changeVersion failed: ' + err.message);
            }, function(){
                debug.log('DB migration to ' + String(number) + ' successfull');
                doMigration(number+1);
            });
        } else {
            // migration done, reload
            if(doReload) {
                debug.log('reloading');
                window.location.reload(true);
            }
        }
    };
    this.doIt = function(){
        var initialVersion = parseInt(db.version) || 0;
        try {
            doMigration(initialVersion+1);
        } catch(e) {
            debug.log(e);
        }
    }
}



RadioDb = function() {

    var that = this;

    var db = null;

    var defaultStations = [
    ['Couleur 3',         'http://stream.srg-ssr.ch/couleur3/mp3_128.m3u', 'a'],
    ['SRF 1',             'http://stream.srg-ssr.ch/drs1/mp3_128.m3u', 'a'],
    ['SRF 2',             'http://stream.srg-ssr.ch/drs2/mp3_128.m3u', 'a'],
    ['SRF 3',             'http://stream.srg-ssr.ch/drs3/mp3_128.m3u', 'a'],
    ['SRF 4 News',        'http://stream.srg-ssr.ch/drs4news/mp3_128.m3u', 'a'],
    ['SRF Virus',         'http://stream.srg-ssr.ch/drsvirus/mp3_128.m3u', 'a'],

    ['Backstageradio',    'http://broadcast.infomaniak.ch/backstageradio-high.mp3.m3u','c'],
    ['Energy Zürich',     'http://statslive.infomaniak.ch/playlist/energyzuerich/energyzuerich-high.mp3/playlist.pls', 'c'],
    ['Energy Bern',       'http://statslive.infomaniak.ch/playlist/energybern/energybern-high.mp3/playlist.pls', 'c'],
    ['Radio 1',           'http://radio.nello.tv:80/128k', 'c'],
    ['Radio 105',         'http://stream.105.ch:8000/105fm','c'],
    ['Radio 24',          'http://icecast.radio24.ch/radio24', 'c'],
    ['Radio 24 Rock',     'http://icecast.radio24.ch/radio24rock','c'],
    ['Radio 24 Pop',      'http://icecast.radio24.ch/radio24pop','c'],
    ['Radio Top',         'http://icecast.radiotop.ch/radiotop','c'],
	['Radio Zürisee',     'http://mp3.radio.ch/radiozuerisee128k','c'],
    ['Radio Bern1',       'http://radio.nello.tv/radiobern1128k','c'],
    ['Radio Swiss Clas…', 'http://stream.srg-ssr.ch/rsc_de/mp3_128.m3u', 'd'],
    ['Radio Swiss Jazz',  'http://stream.srg-ssr.ch/rsj/mp3_128.m3u', 'd'],
    ['Radio Swiss Pop',   'http://stream.srg-ssr.ch/rsp/mp3_128.m3u','d'],
	['SRF Musikwelle',    'http://stream.srg-ssr.ch/drsmw/mp3_128.m3u','d'],
    ['Frequence Banane',  'http://www.frequencebanane.ch/fb_128.m3u', 'e'],
    ['Option Musique',    'http://stream.srg-ssr.ch/option-musique/mp3_128.m3u', 'e'],
    ['RSR La Première',   'http://stream.srg-ssr.ch/la-1ere/mp3_128.m3u', 'e'],
    ['Lounge-radio.com',  'http://www.lounge-radio.com/listen128.m3u','f'],
    ['MagicRadio.CH',     'http://www.magicradio.ch/iphoneAac.m3u','f'],
	['Radio FM1',         'http://radiofm1.ice.infomaniak.ch/playlists/radiofm1-128.mp3.pls','f'],
    ['neo1',              'http://stream-02.neo1.ch/neo1.m3u','f'],
	['Radio X',           'http://mp3.radiox.ch/standard.mp3','f']

    ];

    var ERR_NONDB = 0;
    var ERR_OTHER = 1;
    var ERR_VERSION_MISMATCH = 2;
    var ERR_RESULTSIZE_EXCEEDED = 3;
    var ERR_MAXSIZE_EXCEEDED = 4;
    var ERR_LOCK_ERROR = 5; // contention
    var ERR_CONSTRAINT = 6;

    var upgradeSuccess = function() { debug.log('Successfully upgraded db.'); };
    var upgradeError = function(error) { debug.log('Failed upgrading db.'); return true; /* treat all errs as fatal */ };
    /** Return TRUE for fatal error */
    var errorHandler = function(t, error) {
        if(error.code == ERR_VERSION_MISMATCH) {
            // well, we just log&ignore it.. safari doesn't see the changeVersion effect until restart Oo
            debug.log('ERR_VERSION_MISMATCH');
            return false;
        }
        debug.log('Whoops, DB error: ' + error.message + ' (' + error.code + ')');
        return true; // fatal error
    };

    /** This is used as a data handler for a request that should return no data. */
    var nullDataHandler = function(t, results) {
        return false;
    };

    var insertDefaults = function(t) {
        var insertquery = 'INSERT INTO stations(name, stream, logo, listened_at) VALUES(?, ?, ?, NULL);';
        var selectquery = 'SELECT id, name FROM stations';
        var updatequery = 'UPDATE stations SET stream = ?, logo = ? where id = ?';
        var deletequery = 'DELETE FROM stations where id = ?';
        var defaultStationsName = [];
        for( var i=0; i < defaultStations.length; ++i ) {
            defaultStationsName[defaultStations[i][0]] = defaultStations[i];
            //first we try to insert, then update, this could be improved
            t.executeSql(insertquery, defaultStations[i], nullDataHandler, errorHandler);
        }
        t.executeSql(selectquery, [] , function(t, results) {
            if (results.rows.length == 0) {
                //
            } else {

                for (var j = 0; j < results.rows.length; ++j) {
                    var row = results.rows.item(j);
                    var station = defaultStationsName[row['name']];
                    if (typeof station != 'undefined') {
                        t.executeSql(updatequery,[station[1],station[2],row['id']], nullDataHandler,
                            function(t,error) {
                                console.log("ERRROR UPDATE");
                                console.log(error);
                                return true
                            }
                        );
                    } else {
                        t.executeSql(deletequery ,[row['id']], nullDataHandler,
                            function(t,error) {
                                console.log("ERRROR DELETE");
                                console.log(error);
                                return true
                            }
                        );
                    }

                }

            }
        },
        errorHandler
        );

    };

    this.init = function() {
        try {
            if(!window.openDatabase) {
                alert('Ihr Browser unterstützt kein Local Storage');
            } else {
                db = openDatabase('radios_db', '1', 'Radios Database', 524288); // 512KiB
                debug.log('Current DB Version: ' + db.version);
                db.transaction(function(t) {
                    t.executeSql('CREATE TABLE IF NOT EXISTS stations (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE ON CONFLICT IGNORE, stream TEXT NOT NULL, logo TEXT NOT NULL, listened_at DATE )',
                    [], insertDefaults, errorHandler);
                });
/*
                db = openDatabase('radios_db', '', 'Radios Database', 524288); // 512KiB
                debug.log('Current DB Version: ' + db.version);
                var M = new Migrator(db);
                M.migration(1, function(t) {
                    debug.log('ONE');
                    t.executeSql('CREATE TABLE stations(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE ON CONFLICT IGNORE, stream TEXT NOT NULL, logo TEXT NOT NULL, listened_at DATE )',
                    [], insertDefaults, errorHandler);
                });
                M.doIt();
                */
            }
            return db;
        } catch(e) {
            if(e.code == ERR_VERSION_MISMATCH) {
                debug.log('ERR_VERSION_MISMATCH');
            } else {
                alert('Error: ' + e);
            }
        }
    };

    this.updateListenAt = function(id) {
        db.transaction(function(t) {
            t.executeSql('UPDATE stations SET listened_at = datetime("now","localtime") WHERE id = ?', [ id ], nullDataHandler, errorHandler);
        });
    };

    this.getLastListenedStation = function(resultHandler) {
        db.transaction(function(t) {
            t.executeSql("SELECT id, name, stream, logo, listened_at FROM stations ORDER BY listened_at DESC LIMIT 1", [] , function(t, results) {
                resultHandler( results.rows.length == 0 ? null : results.rows.item(0) );
            }, errorHandler);
        });
    };

    var getStation = function(id, resultHandler, doUpdateListen) {
        if( doUpdateListen )
            that.updateListenAt(id);

        db.transaction(function(t) {
            t.executeSql("SELECT id, name, stream, logo, listened_at FROM stations WHERE id = ?", [ id ] , function(t, results) {
                resultHandler( results.rows.length == 0 ? null : results.rows.item(0) );
            }, errorHandler);
        });
    };

    var getStations = function(resultHandler, filter) {
        var where = '';
        if ( filter ) {
            where = " WHERE name LIKE '%" + filter + "%';"; // FIXME EEEEESCAPE!
        }
        db.transaction(function(t) {
            t.executeSql("SELECT id, name, stream, logo, listened_at FROM stations " + where + " ORDER BY logo ASC, name ASC", [ ] , function(t, results) {
                resultHandler(results.rows);
            }, errorHandler);
        });
    };

    this.insertStation = function(station) {
        db.transaction(function(t) {
            t.executeSql('INSERT INTO stations(name, stream, logo, listened_at) VALUES(?, ?, ?, NULL);', [ station.name, station.stream, station.logo ], nullDataHandler, errorHandler);
        });
    };

    this.autoSearch = function() {
        var searchel = document.getElementById('search-field');
        searchel.onkeyup = function(ev) {
            that.populateStations(searchel.value);
        };
    };

    this.populateStations = function(filter) {
        getStations(function(stations) {
            var ul = document.createElement('ul');
            var li, txt;
            var playing = document.createElement('span');
            var playingOn = document.createTextNode('On');
            playing.setAttribute('class', 'playing');
            playing.appendChild(playingOn);
            radio.playing = playing;
            for( var i=0; i<stations.length; ++i ) {
                li = document.createElement('li');
                txt = document.createTextNode(stations.item(i).name);
                li.appendChild(txt);
                li.setAttribute('id', 'station-'+ stations.item(i).id);
                li.onclick = function(ev) {

                    var id = this.getAttribute('id').split('-')[1];
                    getStation(id, function(station) {
                        var el = document.getElementById('station-'+station.id);

                        if (plugins.AudioStream.getStatus() == 'isPlaying' && station.name == radio.station) {
                            stopSound();
                        } else {
                            radio.station = station.name;
                            radio.stream = station.stream;
                            radio.playingEl = el;
                            radio.clear();
                            radio.noTrack(true);
                            playSound(station.stream);


                        }
                        // remove mute
                        document.getElementById("mute").setAttribute('class', '');
                    }, true);

                };
                ul.appendChild(li);
            }
            // remove current nav
            var statel = document.getElementById("scrollStations");
            if( statel.hasChildNodes() ) {
                while( statel.childNodes.length >= 1 )
                    statel.removeChild(statel.firstChild);
            }
            // append updated nav
            statel.appendChild(ul);
        }, filter);


    };
};


