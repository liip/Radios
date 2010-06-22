//
//  System.m
//  phonegap-edge-test
//
//  Created by Fabian Vogler on 06.02.10.
//  Copyright 2010 Liip AG. All rights reserved.
//

#import "System.h"


#ifndef __IPHONE_3_0
@synthesize webView;
#endif

@implementation System

-(PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView
{
    self = (System*)[super initWithWebView:theWebView];
    return self;
}


- (void)lang:(NSArray*)arguments withDict:(NSDictionary*)options
{
	NSUInteger argc = [arguments count];
	NSString* successCallback = nil;
	if (argc > 0) successCallback = [arguments objectAtIndex:0];
	
	if (argc < 1) {
		NSLog(@"System.lang: Missing 1st parameter.");
		return;
	}
	
	NSUserDefaults* defs = [NSUserDefaults standardUserDefaults];
	NSArray* languages = [defs objectForKey:@"AppleLanguages"];
	NSString* preferredLang = [languages objectAtIndex:0];
	
	NSString* jsString = [[NSString alloc] initWithFormat:@"%@(\"%@\");", successCallback, preferredLang];
	[webView stringByEvaluatingJavaScriptFromString:jsString];
	[jsString release];
}


@end
