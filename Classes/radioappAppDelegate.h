//
//  radioappAppDelegate.h
//  radioapp
//
//  Created by Christian Stocker on 22.02.10.
//  Copyright Liip AG 2010. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "PhoneGapDelegate.h"

@interface radioappAppDelegate : PhoneGapDelegate {
}

- (void) javascriptExecute:(NSString*)text;

@end

