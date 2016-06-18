/*global chrome: true*/

// Extract base url 
function parseURL(page) {
	var urlPattern = /(w{3}\.\w+\.\w+)\//i;
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
			return blacklistedPage === page;	
		});
	};
}

// Delay page load and redirect to waiting page
function delayPageLoad(tabId, delay, destURL) {
    var waitingURL = chrome.extension.getURL('delay.html');
    var delayOver = 0;
//  If user selects another tab during page delay, close the delay page tab
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
   	// If the user sits through the entire delay, load the destination url
	function redirect(tabId) {
        setTimeout(function () {
            if (!delayOver) {
                chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
                    tabs.forEach(function (tab) {
                    if (tab.id === tabId.id && tab.url === waitingURL) {
                        chrome.tabs.update(tabId.id, {url: destURL});
                        delayOver = 1;
                    } else if (tab.id === tabId.id && tab.url !== waitingURL) {
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

// Create listener for updates to blacklisted pages
function createUpdateListener(pageArray) {
	var blackListedURL = createBlacklist(pageArray); 	
	var immuneTabs = [];
	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
		var url = parseURL(changeInfo.url);
		
		//if back button is clicked, allow user to go back to original page 
		function backNavigate(details) {
			if (details.transitionQualifiers.includes('forward_back')) {
				chrome.tabs.executeScript(tabId, {code: 'window.history.back();'});
				immuneTabs.shift();
                chrome.webNavigation.onCommitted.removeListener(backNavigate);
			}
		}
		if (blackListedURL(url) && !(immuneTabs.includes(tab.id))) {
            immuneTabs.push(tab.id);
            chrome.webNavigation.onCommitted.addListener(backNavigate);
            delayPageLoad(tab.id, 10, changeInfo.url);
		}		
	});
}

function main(pageArray) {
	createUpdateListener(pageArray);
}

main(['www.facebook.com', 'www.amazon.com']);
