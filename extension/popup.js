
const wrapper = document.getElementById('wrapper');

document.getElementById('toggler-on').addEventListener('click', () => setActivated(true));
document.getElementById('toggler-off').addEventListener('click', () => setActivated(false));

chrome.runtime.sendMessage({ getState: true });

chrome.runtime.onMessage.addListener(request => {
  if (!request.stateChange) { return; }

  if (request.stateChange.activated) {
    wrapper.classList.remove('disabled');
    wrapper.classList.add('enabled');
  } else {
    wrapper.classList.remove('enabled');
    wrapper.classList.add('disabled');
  }
});

function setActivated(bool) {
  chrome.runtime.sendMessage({ setState: { activated: bool } });
}
