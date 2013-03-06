/*
//  Copyright 2010 Liip AG. All rights reserved.
//  MIT licensed
*/


function System() {

}

System.prototype.lang = function(successCallback) {
    PhoneGap.exec("System.lang", successCallback);
};

PhoneGap.addConstructor(function() {
    if(!window.plugins) {
        window.plugins = {};
    }
    if (System) {
        window.plugins.System = new System();
    }
}

);

