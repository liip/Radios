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
        [ "DRS 1"     , "http://glb-stream11.streamserver.ch/1/regi_zh_sh/mp3_128", "drs1.png"],
        [ "DRS 3"     , "http://zlz-stream10.streamserver.ch/1/drs3/mp3_128", "drs3.png"],
        [ "DRS Virus"     , "http://zlz-stream12.streamserver.ch/1/drsvirus/mp3_128", "drsvirus.png"],
        [ "Couleur 3", "http://broadcast.infomaniak.net:80/rsr-couleur3-high.mp3", ""],
        [ "Radio 1", "http://stream.radio1.ch:8000/radio1", "drs3.png"],
        ['Energy Zürich', 'http://broadcast.infomaniak.net/energyzuerich-high.mp3.pls', ''],
        ['Energy Bern', 'http://broadcast.infomaniak.ch/energybern-high.mp3.pls', ''],
        ['Radio Swiss Jazz', 'http://www.radioswissjazz.ch/live/mp3.m3u', ''],
        ['Radio Swiss Clas…', 'http://www.radioswissclassic.ch/live/mp3.m3u', ''],
        ['Rock Nation', 'http://105-stream-02.datacomm.ch:8000/rocknation', ''],
        ['RSR La Première', 'http://broadcast.infomaniak.net:80/rsr-la1ere-high.mp3', ''],
        ['Option Musique', 'http://broadcast.infomaniak.ch/rsr-optionmusique-high.mp3', ''],
        ['Frequence Banane', 'http://www.frequencebanane.ch/fb_128.m3u', ''],
        ['Backstageradio','http://broadcast.infomaniak.ch/backstageradio-high.mp3.m3u','']
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
    var nullDataHandler = function(t, results) { };
  
    var insertDefaults = function(t) {
        var query = 'INSERT INTO stations(name, stream, logo, listened_at) VALUES(?, ?, ?, NULL);';
        for( var i=0; i < defaultStations.length; ++i ) {
            t.executeSql(query, defaultStations[i], nullDataHandler, errorHandler);
        }
		// Remove old stations
		t.executeSql('DELETE FROM stations WHERE name = ?', ['Radio Argovia'], nullDataHandler, errorHandler);
		t.executeSql('DELETE FROM stations WHERE name = ?', ['Radio Pilatus'], nullDataHandler, errorHandler);
		t.executeSql('DELETE FROM stations WHERE name = ?', ['Radio 24'], nullDataHandler, errorHandler);
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
            t.executeSql("SELECT id, name, stream, logo, listened_at FROM stations " + where + " ORDER BY name ASC", [ ] , function(t, results) {
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

            for( var i=0; i<stations.length; ++i ) {
                li = document.createElement('li');
                txt = document.createTextNode(stations.item(i).name);
                li.appendChild(txt);
                li.setAttribute('id', 'station-'+ stations.item(i).id);
                li.ontouchend = function(ev) { 
          
                    var id = this.getAttribute('id').split('-')[1]; 
                    getStation(id, function(station) {
                        var el = document.getElementById('station-'+station.id);
                        if (radio.station == station.name) {
                             stopSound();
                             radio.station = null;
                             radio.stream = null;
                             el.removeChild(el.querySelector('span'));
                        } else {
                            radio.station = station.name;
                            radio.stream = station.stream;
                            radio.clear();
                            radio.noTrack(true);
                            if (playSound(station.stream)) {
                                el.appendChild(playing);
                            }
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


