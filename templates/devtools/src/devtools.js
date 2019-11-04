'use strict';

// A DevTools extension adds functionality to the Chrome DevTools.
// For more information on DevTools,
// See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/devtools_panels

// Create a panel named `My Panel`
browser.devtools.panels.create('My Panel', '', 'panel.html').then( panel => {
  console.log('Panel was successfully created!');
});
