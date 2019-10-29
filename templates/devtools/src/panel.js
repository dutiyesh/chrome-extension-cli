'use strict';

// For more information on Panels API,
// See https://developer.chrome.com/extensions/devtools_panels

// We will create a panel to detect
// whether current page is using React or not.

import './panel.css';

browser.devtools.inspectedWindow.eval(
  'window.React.version').then((result, isException) => {
    let message = '';
    if (isException) {
      message = 'This page doesn’t appear to be using React.';
    } else {
      message = `The page is using React v${result} ✅`;
    }

    document.getElementById('message').innerHTML = message;
  }
);

// Communicate with background file by sending a message
browser.runtime.sendMessage(
  {
    type: 'GREETINGS',
    payload: {
      message: 'Hello, my name is Pan. I am from Panel.',
    },
  }).then(response => {
    console.log(response.message);
  }
);
