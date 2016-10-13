ezPAARSE Logger
===

ezPAARSE logger is a web application that captures the traffic from the browser and sends it to an  [ezPAARSE](https://github.com/ezpaarse-project/ezpaarse) instance of your choice to analyze it.
This web application is already deployed on http://analogist.couperin.org/ezlogger/ so that you don't have
to install it yourself.

**NB:** works with ezPAARSE **v2.9.0** or greater.

Requirements
===

Get the [companion extension](https://github.com/ezpaarse-project/ezpaarse-logger-extension).

Usage
===

- Ensure that the extension is active.
- Navigate to the [WebApp page](http://analogist.couperin.org/ezlogger/) or click the extension icon.
- Once opened, the app will capture your web traffic as you browse the internet.
- Click 'Analyze' to send the captured traffic to ezPAARSE.

Note
===

You can :
- use any ezPAARSE instance by changing the URL in the settings of the app (defaults to http://127.0.0.1:59599).
- customize the headers sent to ezPAARSE.
- export the captured traffic in a standard EZproxy format.
- filter out the traffic caused by loading CSS, JS and image files.
