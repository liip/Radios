//
//  AudioStream.m
//  phonegap-edge-test
//
//  Created by Christian Stocker on 06.02.10.
//  Copyright 2010 Liip AG. All rights reserved.
//

#import "AudioStream.h"
#import "AudioStreamer.h"
#import <MediaPlayer/MediaPlayer.h>
#import <CFNetwork/CFNetwork.h>
#import <Cordova/CDV.h>



@implementation AudioStream

//
// destroyStreamer
//
// Removes the streamer, the UI update timer and the change notification
//
- (void)destroyStreamer
{
	if (streamer)
	{

	/*
	 [[NSNotificationCenter defaultCenter]
		 removeObserver:self
		 name:ASStatusChangedNotification
		 object:streamer];
	*/


		 /*
		 [progressUpdateTimer invalidate];
		 progressUpdateTimer = nil;
		 */
		[streamer stop];
		[streamer release];
		streamer = nil;
	}
}


//
// createStreamer
//
// Creates or recreates the AudioStreamer object.
//
- (void)createStreamer:(NSString*)urlin
{

	[self destroyStreamer];

	NSString *escapedValue =
	[(NSString *)CFURLCreateStringByAddingPercentEscapes(
														 nil,
														 (CFStringRef)urlin,
														 NULL,
														 NULL,
														 kCFStringEncodingUTF8)
	 autorelease];

	NSURL *url = [NSURL URLWithString:escapedValue];
	streamer = [[AudioStreamer alloc] initWithURL:url];
    /*[streamer
     addObserver:self
     forKeyPath:@"isPlaying"
     options:0
     context:nil];
    */
	streamer.delegate = self;


/*
 [[NSNotificationCenter defaultCenter]
	 addObserver:self
	 selector:@selector(playbackStateChanged:)
	 name:ASStatusChangedNotification
	 object:streamer];
*/
}

- (void)play:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;
    NSString* url = [command.arguments objectAtIndex:0];
    //NSString* metaCallback = [command.arguments objectAtIndex:1];


	//NSUInteger argc = [arguments count];
	//if (argc > 1) metaCallback = [arguments objectAtIndex:1];

	[self createStreamer:url ];
	[streamer start];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)stop:(CDVInvokedUrlCommand*)command
{
    NSLog(@"stop");
	[streamer stop];
}

- (void)mute:(CDVInvokedUrlCommand *)command
{
    NSLog(@"mute");
	[streamer mute];
}

- (void)unmute:(CDVInvokedUrlCommand *)command
{
    NSLog(@"unmute");
	[streamer unmute];
}

- (void)setNowPlaying:(CDVInvokedUrlCommand *)command
{
    if (NSClassFromString(@"MPNowPlayingInfoCenter"))  {
        /* we're on iOS 5, so set up the now playing center */
        NSString  *title      =  [command.arguments objectAtIndex:0];
        NSString  *station      =  [command.arguments objectAtIndex:1];

        NSDictionary *currentlyPlayingTrackInfo = [NSDictionary dictionaryWithObjects:[NSArray arrayWithObjects:title, station, nil] forKeys:[NSArray arrayWithObjects:MPMediaItemPropertyTitle, MPMediaItemPropertyAlbumTitle, nil]];
        [MPNowPlayingInfoCenter defaultCenter].nowPlayingInfo = currentlyPlayingTrackInfo;
    }

}

- (void)streamError
{
	NSLog(@"Stream Error.");
}


- (void)metaDataUpdated:(NSString *)metaData
{

	NSArray *listItems = [metaData componentsSeparatedByString:@";"];

	NSString *metadata;

	if ([listItems count] > 0) {
		metadata = [listItems objectAtIndex:0];
    }

    metadata = [metadata stringByReplacingOccurrencesOfString:@"'" withString:@"\\\'"];

    NSString * jsCallBack = [NSString stringWithFormat:@"window.plugins.AudioStream.setMetaData(' %@ ')",  metadata];
    [self writeJavascript:jsCallBack];

}

- (void)statusChanged:(NSString *)status;
{

   NSString * jsCallBack = [NSString stringWithFormat:@"window.plugins.AudioStream.setStatus( '%@')",  status];
   [self writeJavascript:jsCallBack];
}

@end
