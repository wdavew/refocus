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

function tabExists(tabId) {
    var exists = 0;
    return exists;
}


// Delay page load and redirect to waiting page
function delayPageLoad(tabId, delay, destURL) {
    var waitingURL = chrome.extension.getURL('delay.html');
    var delayOver = 0;
    function createSelectListener(delayedTab) {
        function removeTab(activeInfo) {
            if (!delayOver) {
                chrome.windows.getCurrent({populate: true}, function (window) {
                    window.tabs.forEach(function (tab) {
                        if (tab.id === delayedTab) {
                            setTimeout(function () {
                                chrome.tabs.remove(delayedTab);
                                chrome.tabs.onActivated.removeListener(removeTab);
                                delayOver = 1;
                            }, 100);
                        }
                    });
                });
            }
        }
        chrome.tabs.onActivated.addListener(removeTab);
    }
	function redirect(tabId) {
        setTimeout(function () {
            if (!delayOver) {
                chrome.windows.getCurrent({populate: true}, function (window) {
                    window.tabs.forEach(function (tab) {
                        if (tab.id === tabId.id) {
                            chrome.tabs.update(tabId.id, {url: destURL});
                            delayOver = 1;
                        }
                    });
                });
            }
        }, 3000);
    }

	chrome.tabs.update(tabId, {url: waitingURL});
    createSelectListener(tabId);
	chrome.tabs.get(tabId, redirect);
}

// Called when the user navigates to a given url
function createUpdateListener(pageArray) {
	var blackListedURL = createBlacklist(pageArray); 	
	var immuneTabs = [];
	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
		var url = parseURL(changeInfo.url);
		if (blackListedURL(url) && !(immuneTabs.includes(tab.id))) {
			immuneTabs.push(tab.id);
			delayPageLoad(tab.id, 10, changeInfo.url);
		}		
	});
}


function main(pageArray) {
	createUpdateListener(pageArray);
//	createSelectListener(pageArray);
}
main([/facebook/, /homestarrunner/]);
