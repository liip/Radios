/*
//  Copyright 2010 Liip AG. All rights reserved.
//  MIT licensed
*/

function AudioStream() {
    this.lastMetaData = null;
    this.status = "isStopped";
    this.isLoading = false;
    this.callbacks = {
        onMetaDataChanged: [],
        onStatusChanged: [],
        onError: []
    };
}

AudioStream.prototype.play = function(url,metaCallBack) {
    PhoneGap.exec("AudioStream.play",url,metaCallBack);
    this.isLoading = true;
    this.setStatus("isLoading");
};
AudioStream.prototype.stop = function() {
    PhoneGap.exec("AudioStream.stop");
};
AudioStream.prototype.mute = function() {
    PhoneGap.exec("AudioStream.mute");
};
AudioStream.prototype.unmute = function() {
    PhoneGap.exec("AudioStream.unmute");
};
AudioStream.prototype.setNowPlaying = function(title) {
    PhoneGap.exec("AudioStream.setNowPlaying",title);
};


AudioStream.prototype.getMetaData = function(successCallback, errorCallback, options) {
    if (typeof successCallback == "function") {
        successCallback(this.lastMetaData);
    }
    return this.lastMetaData;
};

AudioStream.prototype.getStatus = function() {
    return this.status;
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
AudioStream.prototype.onMetaDataChange = function(successCallback, errorCallback, options) {
    // Invoke the appropriate callback with a new Position object every time the implementation
    // determines that the position of the hosting device has changed.

    this.getMetaData(successCallback, errorCallback, options);
    this.callbacks.onMetaDataChanged.push(successCallback);
};

AudioStream.prototype.setMetaData = function(metaData) {
    metaData = metaData.replace(/StreamTitle='(.*)'/,"$1");
    this.lastMetaData = metaData;
    for (var i = 0; i < this.callbacks.onMetaDataChanged.length; i++) {

        var f = this.callbacks.onMetaDataChanged[i];
        f(metaData);
    }
};

AudioStream.prototype.onStatusChange = function(successCallback, errorCallback, options) {
    this.callbacks.onStatusChanged.push(successCallback);
};

AudioStream.prototype.setStatus = function(status) {
    this.status = status;
    if (status == 'isPlaying') {
        this.isLoading = false;
    }
    for (var i = 0; i < this.callbacks.onStatusChanged.length; i++) {
        var f = this.callbacks.onStatusChanged[i];
        f(status);
    }
    if (status == 'isStopping' && this.isLoading) {
        this.setStatus('isLoading');
    }
};

PhoneGap.addConstructor(function() {
    if(!window.plugins) {
        window.plugins = {};
    }
    if (AudioStream) {
        window.plugins.AudioStream = new AudioStream();
    }
}

);
