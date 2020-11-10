'use strict';

const path = require('path');
const fs = require('fs-extra');

const { prettifyAppName } = require('../utils/name');

function generateReadme(appDetails, appPath) {
  const appName = prettifyAppName(appDetails.name);

  const readme = `# <img src="public/icons/icon_48.png" width="45" align="left"> ${appName}

${appDetails.description}

## Features

- Feature 1
- Feature 2

## Install

[**Chrome** extension]() <!-- TODO: Add chrome extension link inside parenthesis -->

## Contribution

Suggestions and pull requests are welcomed!.

---

This project was bootstrapped with [Chrome Extension CLI](https://github.com/dutiyesh/chrome-extension-cli)

`;

  fs.writeFileSync(path.join(appPath, 'README.md'), readme);

  return true;
}

module.exports = generateReadme;
