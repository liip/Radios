//
//  AudioStream.h
//  phonegap-edge-test
//
//  Created by Christian Stocker on 06.02.10.
//  Copyright 2010 Liip AG. All rights reserved.
//

#import <Cordova/CDV.h>
#import "AudioStreamer.h"


@interface AudioStream : CDVPlugin {
	AudioStreamer *streamer;

}

- (void)play:(CDVInvokedUrlCommand*)command;
- (void)stop:(CDVInvokedUrlCommand*)command;
- (void)mute:(CDVInvokedUrlCommand*)command;
- (void)unmute:(CDVInvokedUrlCommand*)command;
- (void)setNowPlaying:(CDVInvokedUrlCommand*)command;
- (void)metaDataUpdated:(NSString *)metaData;
- (void)statusChanged:(NSString *)status;
@end
