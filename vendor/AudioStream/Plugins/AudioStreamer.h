//
//  AudioStreamer.h
//  StreamingAudioPlayer
//
//  Created by Matt Gallagher on 27/09/08.
//  Copyright 2008 Matt Gallagher. All rights reserved.
//
// Modified by Mike Jablonski

#ifdef TARGET_OS_IPHONE			
#import <UIKit/UIKit.h>
#else
#import <Cocoa/Cocoa.h>
#endif TARGET_OS_IPHONE			

#include <pthread.h>
#include <AudioToolbox/AudioToolbox.h>

#define kNumAQBufs 12							// number of audio queue buffers we allocate
#define kAQBufSize  3 * 32 * 512		// number of bytes in each audio queue buffer
// 3x for Live365? 1x for everything else?
#define kAQMaxPacketDescs 512		// number of packet descriptions in our array

@interface AudioStreamer : NSObject
{
	id delegate;
	
	// called on the delegate when the metadata string is updated
	SEL didUpdateMetaDataSelector;
	
	// called on the delegate when an error happens
	SEL didErrorSelector;
	
	// called on the delegate when we receive a 302 redirect
	SEL didRedirectSelector;
	
	// called on the delegate when we detect the stream bitrate
	SEL didDetectBitrateSelector;
    
    SEL didStatusChangeSelector;
	
	NSURL *url;
	BOOL isPlaying;
	BOOL redirect;
	BOOL foundIcyStart;
	BOOL foundIcyEnd;
	BOOL parsedHeaders;
	
	NSString *streamContentType;				// the stream content-type from the http headers
	
@public
	NSMutableString *metaDataString;			// the metaDataString

	UIWebView *webView;
	
	AudioFileStreamID audioFileStream;		// the audio file stream parser

	AudioQueueRef audioQueue;																// the audio queue
	AudioQueueBufferRef audioQueueBuffer[kNumAQBufs];		// audio queue buffers
	
	AudioStreamPacketDescription packetDescs[kAQMaxPacketDescs];	// packet descriptions for enqueuing audio
	
	unsigned int fillBufferIndex;		// the index of the audioQueueBuffer that is being filled
	size_t bytesFilled;							// how many bytes have been filled
	size_t packetsFilled;						// how many packets have been filled

	unsigned int metaDataInterval;					// how many data bytes between meta data
	unsigned int metaDataBytesRemaining;	// how many bytes of metadata remain to be read
	unsigned int dataBytesRead;							// how many bytes of data have been read

	bool inuse[kNumAQBufs];			// flags to indicate that a buffer is still in use
	bool started;									// flag to indicate that the queue has been started
	bool failed;									// flag to indicate an error occurred
	bool finished;								// flag to inidicate that termination is requested
																	// the audio queue is not necessarily complete until
																	// isPlaying is also false.
	bool discontinuous;	// flag to trigger bug-avoidance
	unsigned int bitRate;
		
	pthread_mutex_t mutex;			// a mutex to protect the inuse flags
	pthread_cond_t cond;				// a condition varable for handling the inuse flags
	pthread_mutex_t mutex2;		// a mutex to protect the AudioQueue buffer	
	pthread_mutex_t mutexMeta;
	
	CFReadStreamRef stream;
}

@property (nonatomic, retain) NSURL *url;
@property BOOL isPlaying;
@property BOOL redirect;
@property BOOL foundIcyStart;
@property BOOL foundIcyEnd;
@property BOOL parsedHeaders;
@property (nonatomic, copy) NSMutableString *metaDataString;
@property (nonatomic, retain) NSString *streamContentType;
@property (assign) id delegate;
@property (assign) SEL didUpdateMetaDataSelector;
@property (assign) SEL didStatusChangeSelector;
@property (assign) SEL didErrorSelector;
@property (assign) SEL didRedirectSelector;
@property (assign) SEL didDetectBitrateSelector;

- (id)initWithURL:(NSURL *)newURL;
- (void)start;
- (void)stop;
- (void)mute;
- (void)unmute;
- (void)resetAudioQueue;
- (void)restartAudioQueue;

// Called when the metadata is updated - defaults to: @selector(metaDataUpdated:)
- (void)updateMetaData:(NSString *)metaData;

- (NSString *)getMetaDataString;


// Called when an error happens - defaults to: @selector(streamError:)
- (void)audioStreamerError;

// Called when we receive a 302 redirect to another url
- (void)redirectStreamError:(NSURL*)redirectURL;

// Called when we detect the bitrate
- (void)updateBitrate:(uint32_t)br;

@end

