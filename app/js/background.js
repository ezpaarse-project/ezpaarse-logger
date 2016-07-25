chrome.app.runtime.onLaunched.addListener(launchApp);
chrome.runtime.onMessageExternal.addListener((request, sender) => {
  if (request.wakeUp) { launchApp(); }
});

function launchApp() {
  chrome.app.window.create('window.html', {
    'id': 'ezlogger-ui',
    'outerBounds': {
      'width': 800,
      'height': 800
    }
  });
}
