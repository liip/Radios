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

/**
 **/