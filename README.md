ezPAARSE Logger
===

This chrome application captures all the web traffic from the browser and can send it to [ezPAARSE](https://github.com/ezpaarse-project/ezpaarse) to let you analyze it.

**NB:** This extension only works with the last beta version of ezPAARSE (from commit https://github.com/ezpaarse-project/ezpaarse/commit/8088c3ac4828f9ac06d65b66322cf77035e25c8e).

Installation
===

Install both the extension and application from the Chrome Web Store :
- [Extension](https://chrome.google.com/webstore/detail/ezpaarse-logger-extension/cpjllnfdfhkmbkplldfndmfdbabcbidc)
- [Application](https://chrome.google.com/webstore/detail/ezpaarse-logger-app/cgkdokmipoadhnjmckgkmgeffllhhcna)

Usage
===

- Ensure the extension is active
- Launch `ezPAARSE Logger` by clicking the extension icon or opening [chrome://apps](chrome://apps)
- Once opened, the app will capture your web traffic as you browse the internet
- Click 'Analyze' to send the captured traffic to the instance of ezPAARSE

Note
===

You can :
- use any ezPAARSE instance by changing the URL (defaults to http://127.0.0.1:59599) from the app (config button)
- customize the headers sent to ezPAARSE
- export the captured traffic in a log-like format
- filter out the traffic caused by loading CSS, JS and image files
