const port = chrome.runtime.connect({ name: 'ezpaarse-logger' });

port.onMessage.addListener(info => {
  document.dispatchEvent(new CustomEvent('ezlogger-request', { detail: info }));
});
