/* http://developer.apple.com/safari/library/documentation/iPhone/Conceptual/SafariJSDatabaseGuide/UsingtheJavascriptDatabase/UsingtheJavascriptDatabase.html */




if(!RA) var RA = {};

RA.db = function() {
  var db_ = null;
  
  var defaultStations = [
[ "DRS 3", "http://zlz-stream11.streamserver.ch/1/drs3/mp3_128"],
[ "DRS 4", "http://liip.ch"]
];
  
  var ERR_NONDB = 0;
  var ERR_OTHER = 1;
  var ERR_VERSION_MISMATCH = 2;
  var ERR_RESULTSIZE_EXCEEDED = 3;
  var ERR_MAXSIZE_EXCEEDED = 4;
  var ERR_LOCK_ERROR = 5; // contention
  var ERR_CONSTRAINT = 6;
  
  
  
  
  function upgradeSuccess() { console.log('Successfully upgraded db.'); }
  function upgradeError(error) { console.log('Failed upgrading db.'); return true; /* treat all errs as fatal */ }
  /*! Return TRUE for fatal error */
  function errorHandler(transaction, error) {
    alert('ERROR[' + error.code + ']: '+error.message);
    return true;
  }

  /*! This is used as a data handler for a request that should return no data. */
  function nullDataHandler(transaction, results) { }
  
  function createTables(transaction) {
    //transaction.executeSql('DROP TABLE IF EXISTS stations');
    transaction.executeSql('CREATE TABLE stations(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE ON CONFLICT REPLACE, stream TEXT NOT NULL, listened_at DATE );', [], nullDataHandler, errorHandler);
    
    // insert default data
    var query = 'INSERT INTO stations(name, stream, listened_at) VALUES(?, ?, NULL);';
    for( var i=0; i < defaultStations.length; ++i ) {
      transaction.executeSql(query, defaultStations[i], nullDataHandler, errorHandler);
    }
  }

  return {
    upgrade:function(transaction, from, to) {
      console.log('Upgrading db version from  ' + from + ' to ' + to);
      createTables(transaction);
    },

    init: function() {
      var opts = {
        shortName:'radioapp_stations_orly', 
        version:'1.0', 
        displayName:'Stations of RadioApp', 
        maxSize:524288 // 512KiB
      };
      try {
        if(!window.openDatabase) {
          alert('Need window.openDatabase :/');
        } else {

          db_ = openDatabase(opts.shortName, "", opts.displayName, opts.maxSize);
          
          if( db_.version == '' ) {
            db_.transaction(function(trans) { createTables(trans); });
          } else if( db_.version != opts.version ) {
            try {
              if(!db_.changeVersion)
                 alert('Db version changing not supported by this browser');
              else {
                db_.changeVersion(db_.version, opts.version, function(transaction) { RA.db.upgrade(transaction, db_.version, opts.version); }, upgradeSuccess, upgradeError);
              }
  
            } catch(e) {
              alert('Changing db version failed: ' + e);
            }
          }
          db_ = openDatabase(opts.shortName, opts.version, opts.displayName, opts.maxSize);
          console.log('Current db version: '+db_.version + ' (want ' + opts.version + ')');
        }
        return db_;
      } catch(e) {
        if(e.code == ERR_VERSION_MISMATCH) {
          alert('Invalid db version.');
          // this means we have an incomplete/buggy upgrade() method
        } else {
          alert('Unknown error: ' + e);
        }
      }
    },
    
    close: function() {
      
    },
    updateListenAt: function(id) {
      db_.transaction(function(t) {
        t.executeSql('UPDATE stations SET listened_at = datetime("now","localtime") WHERE id = ?', [ id ], nullDataHandler, errorHandler);
      });
    },
    getStation: function(id, resultHandler, updateListen) {
      updateListen = updateListen || false;
      
      if( updateListen )
        this.updateListenAt(id);
        
      db_.transaction(function(t) {
        t.executeSql("SELECT id, name, stream, listened_at FROM stations WHERE id = ?", [ id ] , function(t, results) {
          if( results.rows.length == 0 )
            resultHandler(null);
          else 
            resultHandler(results.rows.item(0));
        }, errorHandler);
      });
    },
    getStations: function(resultHandler, filter) {
      var where = '';
      if ( filter != undefined && filter != '' ) {
        where = " WHERE name LIKE '%" + filter + "%';"; // FIXME EEEEESCAPE!
      }
      db_.transaction(function(t) {
        t.executeSql("SELECT id, name, stream, listened_at FROM stations " + where + " ORDER BY listened_at DESC", [ ] , function(t, results) {
          resultHandler(results.rows);
        }, errorHandler);
      });
    }
  };
}();

function testDb() {
  RA.db.init();
  
  RA.db.getStations(function(rows) {
    for( var i=0; i < rows.length; ++i ) {
      console.log("[" + rows.item(i).id + "] " + rows.item(i).name + " = " + rows.item(i).stream);
    }
  });
  
  RA.db.getStation(1, function(station) {
    console.log(station.name + ' ' + station.listened_at);
  }, true);

}