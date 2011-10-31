//
//  AudioStream.h
//  phonegap-edge-test
//
//  Created by Christian Stocker on 06.02.10.
//  Copyright 2010 Liip AG. All rights reserved.
//

#import "PhoneGapCommand.h"
#import "AudioStreamer.h"


@interface AudioStream : PhoneGapCommand <UITabBarDelegate> {
	AudioStreamer *streamer;

}


- (void)play:(NSArray*)arguments withDict:(NSDictionary*)options;
- (void)stop:(NSArray*)arguments withDict:(NSDictionary*)options;
- (void)mute:(NSArray*)arguments withDict:(NSDictionary*)options;
- (void)unmute:(NSArray*)arguments withDict:(NSDictionary*)options;
- (void)setNowPlaying:(NSArray*)arguments withDict:(NSDictionary*)options;
- (void)metaDataUpdated:(NSString *)metaData;
- (void)statusChanged:(NSString *)status;
@end
