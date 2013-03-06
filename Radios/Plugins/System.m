//
//  System.m
//  phonegap-edge-test
//
//  Created by Fabian Vogler on 06.02.10.
//  Copyright 2010 Liip AG. All rights reserved.
//

#import "System.h"
#import <Cordova/CDV.h>



@implementation System

- (void)lang:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;
    NSString* lang = [command.arguments objectAtIndex:0];
    
    if (lang != nil && [lang length] > 0) {
        NSUserDefaults* defs = [NSUserDefaults standardUserDefaults];
        NSArray* languages = [defs objectForKey:@"AppleLanguages"];
        NSString* preferredLang = [languages objectAtIndex:0];
        
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:preferredLang];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}


@end
