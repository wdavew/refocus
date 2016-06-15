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
	function redirect(tabId) { 
		if (chrome.runtime.lastError) {
			console.log('tab already closed')	
		} else {
		setTimeout(function () { 
			chrome.tabs.update(tabId.id, {url: destURL});
			}, 3000);
		}
	}
	
	var waitingURL = chrome.extension.getURL('delay.html');
	chrome.tabs.update(tabId, {url: waitingURL});
	createSelectListener(tabId);
	chrome.tabs.get(tabId, redirect); 
}




// Called when the user navigates to a given url
function createUpdateListener(pageArray) {
	var blackListedURL = createBlacklist(pageArray); 	
	var immuneTabs = [];
	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
		var waitingURL = chrome.extension.getURL('delay.html');
		var url = parseURL(changeInfo.url);
		if (blackListedURL(url) && !(immuneTabs.includes(tab.id))) {
			immuneTabs.push(tab.id);
			delayPageLoad(tab.id, 10, changeInfo.url);
		}		
	});
}

function removeTab(activeInfo) {
	if (activeInfo.tabId != delayedTabId){
		setTimeout(function () {
			chrome.tabs.remove(delayedTabId);
		//	chrome.tabs.onActivated.removeListener(removeTab(activeInfo));
		}, 100)
	}
}

// Called when the user navigates to a given url
function createSelectListener(delayedTabId) {
	chrome.tabs.onActivated.addListener(function(activeInfo) {
		if (activeInfo.tabId != delayedTabId){
			setTimeout(function () {
				chrome.tabs.remove(delayedTabId);
			}, 100)
		}	
	});
}

function main(pageArray) {
	createUpdateListener(pageArray);
//	createSelectListener(pageArray);
}
main([/facebook/, /homestarrunner/]);
