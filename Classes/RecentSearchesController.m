
/*
     File: RecentSearchesController.m
 Abstract: A table view controller to manage and display a list of recent search strings.
 The search strings are stored in NSUserDefaults to maintain the list between launches of the application.
 The view controller manages two arrays:
 * recentSearches is the array that corresponds to the full set of recent search strings stored in user defaults.
 * displayedRecentSearches is an array derived from recent searches, filtered by the current search string (if any).
 
 The recentSearches array is kept synchronized with user defaults, and avoids the need to query user defaults every time the search string is updated.
 
 The table view displays the contents of the displayedRecentSearches array.
 
 The view controller has a delegate that it notifies if row in the table view is selected.
 
  Version: 1.0
 
 Disclaimer: IMPORTANT:  This Apple software is supplied to you by Apple
 Inc. ("Apple") in consideration of your agreement to the following
 terms, and your use, installation, modification or redistribution of
 this Apple software constitutes acceptance of these terms.  If you do
 not agree with these terms, please do not use, install, modify or
 redistribute this Apple software.
 
 In consideration of your agreement to abide by the following terms, and
 subject to these terms, Apple grants you a personal, non-exclusive
 license, under Apple's copyrights in this original Apple software (the
 "Apple Software"), to use, reproduce, modify and redistribute the Apple
 Software, with or without modifications, in source and/or binary forms;
 provided that if you redistribute the Apple Software in its entirety and
 without modifications, you must retain this notice and the following
 text and disclaimers in all such redistributions of the Apple Software.
 Neither the name, trademarks, service marks or logos of Apple Inc. may
 be used to endorse or promote products derived from the Apple Software
 without specific prior written permission from Apple.  Except as
 expressly stated in this notice, no other rights or licenses, express or
 implied, are granted by Apple herein, including but not limited to any
 patent rights that may be infringed by your derivative works or by other
 works in which the Apple Software may be incorporated.
 
 The Apple Software is provided by Apple on an "AS IS" basis.  APPLE
 MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION
 THE IMPLIED WARRANTIES OF NON-INFRINGEMENT, MERCHANTABILITY AND FITNESS
 FOR A PARTICULAR PURPOSE, REGARDING THE APPLE SOFTWARE OR ITS USE AND
 OPERATION ALONE OR IN COMBINATION WITH YOUR PRODUCTS.
 
 IN NO EVENT SHALL APPLE BE LIABLE FOR ANY SPECIAL, INDIRECT, INCIDENTAL
 OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 INTERRUPTION) ARISING IN ANY WAY OUT OF THE USE, REPRODUCTION,
 MODIFICATION AND/OR DISTRIBUTION OF THE APPLE SOFTWARE, HOWEVER CAUSED
 AND WHETHER UNDER THEORY OF CONTRACT, TORT (INCLUDING NEGLIGENCE),
 STRICT LIABILITY OR OTHERWISE, EVEN IF APPLE HAS BEEN ADVISED OF THE
 POSSIBILITY OF SUCH DAMAGE.
 
 Copyright (C) 2010 Apple Inc. All Rights Reserved.
 
 */

#import "RecentSearchesController.h"



NSString *RecentSearchesKey = @"RecentSearchesKey";


@implementation RecentSearchesController

@synthesize delegate, recentSearches, displayedRecentSearches;


#pragma mark -
#pragma mark View lifecycle

- (void)viewDidLoad {
    [super viewDidLoad];

    self.title = @"Recents";

    // Create a button item to clear the recents list.
    UIBarButtonItem *clearButtonItem = [[UIBarButtonItem alloc] initWithTitle:@"Clear" style:UIBarButtonItemStyleBordered target:self action:@selector(clearRecents:)];
    self.navigationItem.leftBarButtonItem = clearButtonItem;
    [clearButtonItem release];
    
    // Set up the recent searches list, from user defaults or using an empty array.
    NSArray *recents = [[NSUserDefaults standardUserDefaults] objectForKey:RecentSearchesKey];
    if (recents) {
        self.recentSearches = recents;
        self.displayedRecentSearches = recents;
    }
    else {
        self.recentSearches = [NSArray array];
        self.displayedRecentSearches = [NSArray array];
    }
}


- (void)viewWillAppear:(BOOL)animated {
 
    // Ensure the complete list of recents is shown on first display.
    [super viewWillAppear:animated];
    self.displayedRecentSearches = recentSearches;
}


- (CGSize)contentSizeForViewInPopoverView {
    return CGSizeMake(300.0, 280.0);
}


- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation {
    return YES;
}


- (void)viewDidUnload {
    [super viewDidUnload];
    self.recentSearches = nil;
    self.displayedRecentSearches = nil;
}


#pragma mark -
#pragma mark Managing the recents list

- (void)addToRecentSearches:(NSString *)searchString {
    
    // Filter out any strings that shouldn't be in the recents list.
    if ([searchString isEqualToString:@""]) {
        return;
    }
    
    // Create a mutable copy of recent searches and remove the search string if it's already there (it's added to the top of the list later).

    NSMutableArray *mutableRecents = [recentSearches mutableCopy];
    [mutableRecents removeObject:searchString];
    
    // Add the new string at the top of the list.
    [mutableRecents insertObject:searchString atIndex:0];
    
    // Update user defaults.
    [[NSUserDefaults standardUserDefaults] setObject:mutableRecents forKey:RecentSearchesKey];

    // Set self's recent searches to the new recents array, and reload the table view.
    self.recentSearches = mutableRecents;
    self.displayedRecentSearches = mutableRecents;
    [self.tableView reloadData];
}


- (void)filterResultsUsingString:(NSString *)filterString {

    /*
     If the search string is zero-length, then restore the recent searches, otherwise create a predicate to filter the recent searches using the search string.
     */
    if ([filterString length] == 0) {
        self.displayedRecentSearches = recentSearches;
    }
    else {
        NSPredicate *filterPredicate = [NSPredicate predicateWithFormat:@"self BEGINSWITH[cd] %@", filterString];
        NSArray *filteredRecentSearches = [recentSearches filteredArrayUsingPredicate:filterPredicate];
        self.displayedRecentSearches = filteredRecentSearches;
    }

    [self.tableView reloadData];
}


- (void)clearRecents:(id)sender {
    
    // Remove the recents entry from user defaults, set the list to an empty array, and redisplay the table view.
    [[NSUserDefaults standardUserDefaults] setObject:nil forKey:RecentSearchesKey];
    self.recentSearches = [NSArray array];
    self.displayedRecentSearches = [NSArray array];
    [self.tableView reloadData];
}


#pragma mark Table view methods

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return [displayedRecentSearches count];
}


// Display the strings in displayedRecentSearches.
- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    
    static NSString *CellIdentifier = @"Cell";
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (cell == nil) {
        cell = [[[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:CellIdentifier] autorelease];
    }
    
    cell.textLabel.text = [displayedRecentSearches objectAtIndex:indexPath.row];    
    return cell;
}


- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    // Notify the delegate if a row is selected.
    [delegate recentSearchesSelectedString:[displayedRecentSearches objectAtIndex:indexPath.row]];
}


#pragma mark -
#pragma mark Memory management

- (void)dealloc {
    [recentSearches release];
    [displayedRecentSearches release];
    [super dealloc];
}


@end

