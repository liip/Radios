//
//  UAApplication.m
//  radioapp
//
//  Created by Christian Stocker on 09.06.10.
//  Copyright 2010 Liip AG. All rights reserved.
//

#import "UAApplication.h"


@implementation UAApplication

- (id) init {
    self = [super init];
    return self;
}

#pragma mark -
#pragma mark UIResponder
-(BOOL)canBecomeFirstResponder {
    return YES;
}

#pragma mark -
#pragma mark Remote Control
- (void) remoteControlReceivedWithEvent:(UIEvent *)event {
    NSLog(@"remoteControlReceivedWithEvent: %d", event.subtype);
    
    switch (event.subtype) {
        case UIEventSubtypeRemoteControlTogglePlayPause:
            [self.delegate javascriptExecute:@"toggleSound()"];
            break;
        case UIEventSubtypeRemoteControlPlay:
            [self.delegate javascriptExecute:@"playSound(radio.stream)"];
            break;
        case UIEventSubtypeRemoteControlPause:
        case UIEventSubtypeRemoteControlStop:
            [self.delegate javascriptExecute:@"stopSound()"];
            break;
        case UIEventSubtypeRemoteControlNextTrack:
           
//            [[self.delegate getCommandInstance:@"AudioStream"] unmute:nil withDict:nil];
            break;
        case UIEventSubtypeRemoteControlPreviousTrack:
            break;
        default:
            break;
    }
}

@end


