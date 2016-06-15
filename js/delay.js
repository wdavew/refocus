/*global chrome: true */
function blockPage(delay) {
	chrome.runtime.sendMessage({redirect: chrome.extension.getURL('delay.html')});
}

blockPage(10);
