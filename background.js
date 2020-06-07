// Required because Chrome
// Copy 'n' Pasted Copyright 2019 [maximelian1986](https://stackoverflow.com/users/3352734/maximelian1986) "[Chrome extension show popup in page action](https://stackoverflow.com/questions/54167719/chrome-extension-show-popup-in-page-action)" [CC BY-SA-2.0]()
chrome.runtime.onInstalled.addListener(function() {

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostEquals: 'www.furaffinity.net', schemes: ['https'] }
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});


