const appId = 'gmdhbankhgdcnjiemccbfpopmdbdodhn';

window.onload = function () {
  document.getElementById('launch-button').addEventListener('click', function launchApp() {
    chrome.runtime.sendMessage(appId, { wakeUp: true });
  });
};
