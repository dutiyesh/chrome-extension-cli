# Chrome Extension FAQs

## How to load chrome extension in browser?

Follow these instructions to load your extension in browser:
1. Open **chrome://extensions**
2. Check the **Developer mode** checkbox
3. Click on the **Load unpacked extension** button
4. Select the folder **my-extension/build**

> Note: `build` folder is created when you run either `npm run watch` (for development) or `npm run build` (for production) command.

## Why are my changes in `popup.js` file not reflecting?
You will have to close the extension popup window and open it again.<br>
Because opening the popup is same as reloading a page.

## Why are my changes in `contentScript.js` file not reflecting?
You will have to reload the extension and then reload the page.<br>
To reload an extension:
1. Open **chrome://extensions**
2. Locate your extension
3. Click the **Reload** icon adjacent to checkbox (_at bottom right of extension card_)

> Note: See [Issue 104610: Allow content scripts to update without reloading the extension](https://bugs.chromium.org/p/chromium/issues/detail?id=104610)

## Why are my changes in `background.js` file not reflecting?
You will have to reload the extension and then reload the page.<br>
To reload an extension:
1. Open **chrome://extensions**
2. Locate your extension
3. Click the **Reload** icon adjacent to checkbox (_at bottom right of extension card_)

## Why are my changes in Popup HTML file not reflecting?
You will have to close the extension popup window and open it again by clicking the extension icon from toolbar.<br>
Because opening the popup is same as reloading a page.

## Why are my changes in Override HTML file not reflecting?
You will have to reload the page and your changes will start reflecting.
To reload an extension:
1. Open **chrome://extensions**
2. Locate your extension
3. Click the **Reload** icon adjacent to checkbox (_at bottom right of extension card_)

## Why are my changes in DevTools Panel HTML file not reflecting?
DevTools Panel is nothing but a HTML page, which you can reload by following the instructions:
1. Right-click on the Panel HTML
2. Click **Reload Frame**
3. And the Panel HTML page will reload
