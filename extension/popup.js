window.onload = function () {
  const appName      = 'ezpaarse logger (app)';
  const installText  = document.getElementById('install');
  const launchButton = document.getElementById('launch-button')

  chrome.management.getAll(extensions => {
    const ext = extensions.find(e => (e.name.toLowerCase() === appName));

    if (!ext) {
      launchButton.style.display = 'none';
      installText.style.display  = 'block';
      return;
    }

    launchButton.addEventListener('click', function launchApp() {
      if (ext.enabled) {
        return chrome.management.launchApp(ext.id);
      }

      if (confirm('The application is disabled. Do you want to enable it ?')) {
        chrome.management.setEnabled(ext.id, true, () => {
          chrome.management.launchApp(ext.id);
        });
      }
    });
  });
};
