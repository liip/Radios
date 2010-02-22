    //
//  radioappViewController.m
//  radioapp
//
//  Created by Christian Stocker on 22.02.10.
//  Copyright 2010 Liip AG. All rights reserved.
//

#import "radioappViewController.h"
#import "RecentSearchesController.h"

@interface radioappViewController()
- (void)finishSearchWithString:(NSString *)searchString;
@end

@implementation radioappViewController

@synthesize toolbar, searchBar, recentSearchesController, recentSearchesPopoverController, progressLabel;


- (void)viewDidLoad {
    [super viewDidLoad];
    
    // Create and configure a search bar.
    searchBar = [[UISearchBar alloc] initWithFrame:CGRectMake(0.0, 0.0, 400.0, 0.0)];
    searchBar.delegate = self;
    
    
    // Create a bar button item using the search bar as its view.
    UIBarButtonItem *searchItem = [[UIBarButtonItem alloc] initWithCustomView:searchBar];
    // Create a space item and set it and the search bar as the items for the toolbar.
    UIBarButtonItem *spaceItem = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemFlexibleSpace target:nil action:NULL];
    toolbar.items = [NSArray arrayWithObjects:spaceItem, searchItem, nil];
    [spaceItem release];
    [searchItem release];    
    
    // Create and configure the recent searches controller.
    RecentSearchesController *aRecentsController = [[RecentSearchesController alloc] initWithStyle:UITableViewStylePlain];
    self.recentSearchesController = aRecentsController;
    recentSearchesController.delegate = self;
    
    // Create a navigation controller to contain the recent searches controller, and create the popover controller to contain the navigation controller.
    UINavigationController *navigationController = [[UINavigationController alloc] initWithRootViewController:recentSearchesController];
    
    UIPopoverController *popover = [[UIPopoverController alloc] initWithContentViewController:navigationController];
    self.recentSearchesPopoverController = popover;
    recentSearchesPopoverController.delegate = self;
    
    [navigationController release];
    [aRecentsController release];
    [popover release];
}


#pragma mark -
#pragma mark Search results controller delegate method

- (void)recentSearchesSelectedString:(NSString *)searchString {
    
    /*
     The user selected a row in the recent searches list.
     Set the text in the search bar to the search string, and conduct the search.
     */
    searchBar.text = searchString;
    [self finishSearchWithString:searchString];
}


#pragma mark -
#pragma mark Search bar delegate methods

- (void)searchBarTextDidBeginEditing:(UISearchBar *)aSearchBar {
    
    // Display the search results controller popover.
    [recentSearchesPopoverController presentPopoverFromRect:[searchBar bounds] inView:searchBar permittedArrowDirections:UIPopoverArrowDirectionAny animated:YES];
}


- (void)searchBarTextDidEndEditing:(UISearchBar *)aSearchBar {
    
    // If the user finishes editing text in the search bar by, for example tapping away rather than selecting from the recents list, then just dismiss the popover.
    [recentSearchesPopoverController dismissPopoverAnimated:YES];
    [aSearchBar resignFirstResponder];
}


- (void)searchBar:(UISearchBar *)searchBar textDidChange:(NSString *)searchText {
    
    // When the search string changes, filter the recents list accordingly.
    [recentSearchesController filterResultsUsingString:searchText];
}


- (void)searchBarSearchButtonClicked:(UISearchBar *)aSearchBar {
    
    // When the search button is tapped, add the search term to recents and conduct the search.
    NSString *searchString = [searchBar text];
    [recentSearchesController addToRecentSearches:searchString];
    [self finishSearchWithString:searchString];
}


- (void)finishSearchWithString:(NSString *)searchString {
    
    // Conduct the search. In this case, simply report the search term used.
    [recentSearchesPopoverController dismissPopoverAnimated:YES];
    progressLabel.text = [NSString stringWithFormat:@"Performed a search using \"%@\".", searchString];
    [searchBar resignFirstResponder];
}


- (void)popoverControllerDidDismissPopover:(UIPopoverController *)popoverController {
    
    // Remove focus from the search bar without committing the search.
    progressLabel.text = @"Canceled a search.";
    [searchBar resignFirstResponder];
}


/*
 // The designated initializer.  Override if you create the controller programmatically and want to perform customization that is not appropriate for viewDidLoad.
- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil {
    if ((self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil])) {
        // Custom initialization
    }
    return self;
}
*/

/*
// Implement loadView to create a view hierarchy programmatically, without using a nib.
- (void)loadView {
}
*/

/*
// Implement viewDidLoad to do additional setup after loading the view, typically from a nib.
- (void)viewDidLoad {
    [super viewDidLoad];
}
*/


- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation {
    // Overriden to allow any orientation.
    return YES;
}


- (void)didReceiveMemoryWarning {
    // Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];
    
    // Release any cached data, images, etc that aren't in use.
}


- (void)viewDidUnload {
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}


- (void)dealloc {
    [super dealloc];
}


@end
