//
//  main.m
//  radioapp
//
//  Created by Christian Stocker on 22.02.10.
//  Copyright Liip AG 2010. All rights reserved.
//

#import <UIKit/UIKit.h>

int main(int argc, char *argv[]) {
    
    NSAutoreleasePool * pool = [[NSAutoreleasePool alloc] init];
    int retVal = UIApplicationMain(argc, argv, @"UAApplication", @"radioappAppDelegate");
    [pool release];
    return retVal;
}
