chrome.app.runtime.onLaunched.addListener(() => {
  chrome.app.window.create('window.html', {
    'id': 'ezlogger-ui',
    'outerBounds': {
      'width': 800,
      'height': 800
    }
  });
});
