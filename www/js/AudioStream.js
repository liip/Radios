/*
 //  This code is adapted from the work of:
 //  Created by Michael Nachbaur on 13/04/09.
 //  Copyright 2009 Decaf Ninja Software. All rights reserved.
 //  MIT licensed
 */

/**
 * This class exposes mobile phone interface controls to JavaScript, such as
 * native tab and tool bars, etc.
 * @constructor
 */
function AudioStream() {
    this.lastMetaData = null;
    this.callbacks = {
	onMetaDataChanged: [],
	onError: []
    };
}

AudioStream.prototype.play = function(url,metaCallBack) {
    PhoneGap.exec("AudioStream.play",url,metaCallBack);
};
AudioStream.prototype.stop = function() {
    PhoneGap.exec("AudioStream.stop");
};

AudioStream.prototype.getMetaData = function(successCallback, errorCallback, options) {
    if (typeof successCallback == "function") {
        successCallback(this.lastMetaData);
    }
    return this.lastMetaData;
}


/**
 * Asynchronously aquires the heading repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the heading
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the heading data.
 * @param {HeadingOptions} options The options for getting the heading data
 * such as timeout and the frequency of the watch.
 */
AudioStream.prototype.onMetaDataChange= function(successCallback, errorCallback, options) {
    // Invoke the appropriate callback with a new Position object every time the implementation 
    // determines that the position of the hosting device has changed. 
    
    this.getMetaData(successCallback, errorCallback, options);
    this.callbacks.onMetaDataChanged.push(successCallback);
};


AudioStream.prototype.setMetaData = function(metaData) {
    this.lastMetaData = metaData;
    for (var i = 0; i < this.callbacks.onMetaDataChanged.length; i++) {
        
        var f = this.callbacks.onMetaDataChanged[i];
        f(metaData);
    }
};


PhoneGap.addConstructor(function() 
                      	{
							if(!window.plugins)
						{
						window.plugins = {};
						}
						if (AudioStream) {
							window.plugins.AudioStream = new AudioStream();
						}
						}
                      						
						);

/**
 **/