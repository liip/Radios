//
//  System.h
//  phonegap-edge-test
//
//  Created by Christian Stocker on 06.02.10.
//  Copyright 2010 Liip AG. All rights reserved.
//

#import "PhoneGapCommand.h"


@interface System : PhoneGapCommand <UITabBarDelegate> {
	
}


- (void)lang:(NSArray*)arguments withDict:(NSDictionary*)options;
@end
