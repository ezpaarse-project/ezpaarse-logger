ezPAARSE Logger DevTools Extension
===

This chrome extension integrates into devtools. It captures the web traffic and analyzes it with [ezPAARSE](https://github.com/ezpaarse-project/ezpaarse).  
**NB:** this extension only works with the last beta version of ezPAARSE.

Installation
===

### From Chrome Web Store
*Coming soon !*

### Using developer mode
 * Clone the repository or download as archive
 * Open [chrome://extensions](chrome://extensions)
 * Enable 'Developer Mode' checkbox
 * Click 'Load unpacked extensions...'
 * Select the `src` folder

Usage
===

- While on any page, launch the devtools. You should see a new tab called `ezLogger`.
- Once opened, the web traffic will be captured as you browse the internet.
- Click 'Analyze' to send the captured traffic to ezPAARSE.

Note
===

You can :
- use any ezPAARSE instance by changing the URL (defaults to http://127.0.0.1:59599).
- customize the headers that are sent to ezPAARSE.
- export the captured traffic in a log-like format.
