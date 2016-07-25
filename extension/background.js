let port = null;

chrome.webRequest.onCompleted.addListener(details => {
  if (port) { port.postMessage(details); }
}, { urls: ['<all_urls>'] });

// long-lived connection
chrome.runtime.onConnectExternal.addListener(p => { port = p; });
