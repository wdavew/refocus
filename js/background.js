/*global chrome: true*/
// Extract the hostname from a url
function parseURL(page) {
	var urlPattern = /w{3}\.(\w+)\./i;
	try {
		return urlPattern.exec(page)[1];
	} catch (e) {  		
		return null;
	}
}

// Return a blacklist testing function
function createBlacklist(blackListArray) {
	return function(page) {
		return blackListArray.some(function (blacklistedPage) {
			return blacklistedPage.test(page);	
		});
	};
}

// Delay page load and redirect to waiting page
function delayPageLoad(tabId, delay) {
	var waitingURL = chrome.extension.getURL('delay.html');
	chrome.tabs.update(tabId, {url: waitingURL});
}


// Called when the user navigates to a given url
function main(pageArray) {
	var blackListedURL = createBlacklist(pageArray); 	
	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	var url = parseURL(changeInfo.url);	
		if (blackListedURL(url)){
			console.log('Blacklisted');
			delayPageLoad(tabId, 10);	
		}		
	});
}

main([/facebook/, /homestarrunner/]);
