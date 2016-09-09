ezPAARSE Logger
===

This chrome web application captures all the traffic from the browser and send it to [ezPAARSE](https://github.com/ezpaarse-project/ezpaarse) to analyze it.

**NB:** works with ezPAARSE **v2.9.0** or greater.

Installation
===

Get the [companion extension](https://chrome.google.com/webstore/detail/ezpaarse-logger-extension/cpjllnfdfhkmbkplldfndmfdbabcbidc) from the Chrome Web Store.

Usage
===

- Ensure that the extension is active
- Go to the [WebApp page](https://ezpaarse-project.github.io/ezpaarse-logger/) or click the extension icon
- Once opened, the app will capture your web traffic as you browse the internet
- Click 'Analyze' to send the captured traffic to ezPAARSE

Note
===

You can :
- use any ezPAARSE instance by changing the URL (defaults to http://127.0.0.1:59599) from the app (config button)
- customize the headers sent to ezPAARSE
- export the captured traffic in a standard EZproxy format
- filter out the traffic caused by loading CSS, JS and image files
