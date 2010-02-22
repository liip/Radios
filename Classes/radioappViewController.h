//
//  radioappViewController.h
//  radioapp
//
//  Created by Christian Stocker on 22.02.10.
//  Copyright 2010 Liip AG. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "PhoneGapViewController.h"
#import "RecentSearchesController.h"


@interface radioappViewController : PhoneGapViewController <UISearchBarDelegate, UIPopoverControllerDelegate, RecentSearchesDelegate> {
    UIToolbar *toolbar;
    UISearchBar *searchBar;
    
   RecentSearchesController *recentSearchesController;
    UIPopoverController *recentSearchesPopoverController;
    
    UILabel *progressLabel;
    
}

@property (nonatomic, retain) IBOutlet UIToolbar *toolbar;
@property (nonatomic, retain) IBOutlet UISearchBar *searchBar;

@property (nonatomic, retain) RecentSearchesController *recentSearchesController;
@property (nonatomic, retain) UIPopoverController *recentSearchesPopoverController;

@property (nonatomic, retain) IBOutlet UILabel *progressLabel;

@end
