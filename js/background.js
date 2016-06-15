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

function getTabURL(tab) {
	return chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {
		return tabs[0].url;
	});
}
// Delay page load and redirect to waiting page
function delayPageLoad(tabId, delay, destURL) {
	var waitingURL = chrome.extension.getURL('delay.html');
	setTimeout(function (tabId) {
		chrome.tabs.update(tabId, {url: destURL});
	}, 5000);	
	chrome.tabs.update(tabId, {url: waitingURL});
}


// Called when the user navigates to a given url
function createUpdateListener(pageArray) {
	var blackListedURL = createBlacklist(pageArray); 	
	var i = 1;
	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
		var waitingURL = chrome.extension.getURL('delay.html');
		var url = parseURL(changeInfo.url);
		console.log(tab.url);	
		if (blackListedURL(url) && i < 2) {
			i = i + 1;	
			delayPageLoad(tabId, 10, changeInfo.url);	
		}		
	});
}

// Called when the user navigates to a given url
function createSelectListener(pageArray) {
	var blackListedURL = createBlacklist(pageArray); 	
	chrome.tabs.onActivated.addListener(function (activeInfo) {
		var tabURL = getTabURL();
		var url = parseURL(tabURL);
		console.log(url);	
		if (blackListedURL(url)){
			delayPageLoad(activeInfo.tabId, 10, url);
		}	
	});
}

function main(pageArray) {
	createUpdateListener(pageArray);
//	createSelectListener(pageArray);
}
main([/facebook/, /homestarrunner/]);
