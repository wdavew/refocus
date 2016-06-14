// Called when the user navigates to a given url
var urlPattern = 'facebook';	
chrome.webNavigation.onDOMContentLoaded.addListener(function (details) {
	console.log('Running Script');
	}, {url: [{hostEquals: urlPattern}]});

