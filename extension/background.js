const ports = new Set();
const tabs  = new Set();

const icons = {
  enabled: {
    16: 'img/ezlogger-16.png',
    48: 'img/ezlogger-48.png',
    128: 'img/ezlogger-128.png'
  },
  disabled: {
    16: 'img/ezlogger-disabled-16.png',
    48: 'img/ezlogger-disabled-48.png',
    128: 'img/ezlogger-disabled-128.png'
  }
};

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

chrome.storage.local.get('activated', item => {
  const activated = item && item.activated;
  setActivated(activated === undefined ? true : activated);
});

chrome.runtime.onMessage.addListener(request => {
  if (request.getState) {
    sendState();
  } else if (request.setState) {
    setActivated(request.setState.activated);
  }
});

/**
 * Enable or disable the extension by adding/removing the network listener
 * @param {Boolean} activated
 */
function setActivated(activated) {
  activated = !!activated;

  chrome.browserAction.setIcon({ path: activated ? icons.enabled : icons.disabled });

  if (!activated) {
    chrome.webRequest.onCompleted.removeListener(networkListener);
  } else if (!isActivated()) {
    chrome.webRequest.onCompleted.addListener(networkListener, { urls: ['*://*/*'] }, ['responseHeaders']);
  }

  chrome.storage.local.set({ activated: activated });
  sendState();
}

/**
 * Notify the popup about the current state
 */
function sendState() {
  chrome.runtime.sendMessage({ stateChange: { activated: isActivated() } });
}

/**
 * Check whether the network is being listened or not
 * @return {Boolean}
 */
function isActivated() {
  return chrome.webRequest.onCompleted.hasListener(networkListener);
}

/**
 * Network listener, send request details to the web app
 * @param  {Object} details  request details
 */
function networkListener(details) {
  if (tabs.has(details.tabId)) { return; }
  ports.forEach(port => port.postMessage(JSON.stringify(details)));
}
