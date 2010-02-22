//
//  radioappAppDelegate.h
//  radioapp
//
//  Created by Christian Stocker on 22.02.10.
//  Copyright Liip AG 2010. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "PhoneGapDelegateXib.h"

@interface radioappAppDelegate : PhoneGapDelegateXib {
}
@property (nonatomic, retain) IBOutlet PhoneGapViewController *viewController;

@end

