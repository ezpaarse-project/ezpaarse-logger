ezPAARSE Logger DevTools Extension
===

This chrome extension integrates into devtools. It captures the web traffic and analyzes it with [ezPAARSE](https://github.com/ezpaarse-project/ezpaarse).  
**NB:** this extension only works with the last beta version of ezPAARSE.

Installation
===

Install both the extension and application from the Chrome Web Store :
- [Extension](https://chrome.google.com/webstore/detail/ezpaarse-logger-extension/cpjllnfdfhkmbkplldfndmfdbabcbidc)
- [Application](https://chrome.google.com/webstore/detail/ezpaarse-logger-app/cgkdokmipoadhnjmckgkmgeffllhhcna)

Usage
===

- Ensure the extension is active
- Launch `ezPAARSE Logger` by clicking the extension icon or opening [chrome://apps/](chrome://apps/)
- Once opened, the web traffic will be captured as you browse the internet.
- Click 'Analyze' to send the captured traffic to ezPAARSE.

Note
===

You can :
- use any ezPAARSE instance by changing the URL (defaults to http://127.0.0.1:59599).
- customize the headers that are sent to ezPAARSE.
- export the captured traffic in a log-like format.
