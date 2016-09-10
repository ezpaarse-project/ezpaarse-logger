const ports = new Set();
const tabs  = new Set();

chrome.webRequest.onCompleted.addListener(details => {
  if (tabs.has(details.tabId)) { return; }

  ports.forEach(port => port.postMessage(JSON.stringify(details)));
}, { urls: ['<all_urls>'] }, ['responseHeaders']);

// long-lived connection
chrome.runtime.onConnect.addListener(port => {
  if (port.name !== 'ezpaarse-logger') { return; }

  const tabId = port.sender && port.sender.tab && port.sender.tab.id;

  ports.add(port);
  if (tabId) { tabs.add(tabId); }

  port.onDisconnect.addListener(() => {
    ports.delete(port);
    if (tabId) { tabs.delete(tabId); }
  });
});
