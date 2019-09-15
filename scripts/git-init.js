// Code taken from Create React App's `react-script`
// https://github.com/facebook/create-react-app/blob/47e9e2c7a07bfe60b52011cf71de5ca33bdeb6e3/packages/react-scripts/scripts/init.js

'use strict';

const path = require('path');
const fs = require('fs-extra');
const execSync = require('child_process').execSync;

function tryGitInit(appPath) {
  let didInit = false;

  try {
    execSync('git --version', { cwd: appPath, stdio: 'ignore' });

    try {
      // Check if it is already in a git repository
      execSync('git rev-parse --is-inside-work-tree', {
        cwd: appPath,
        stdio: 'ignore',
      });
      return false;
    } catch (e) {
      // Ignore.
    }

    execSync('git init', { cwd: appPath, stdio: 'ignore' });
    didInit = true;

    execSync('git add -A', { cwd: appPath, stdio: 'ignore' });
    execSync('git commit -m "Initial commit from Chrome Extension CLI"', {
      cwd: appPath,
      stdio: 'ignore',
    });
    return true;
  } catch (e) {
    if (didInit) {
      try {
        fs.removeSync(path.join(appPath, '.git'));
      } catch (removeErr) {
        // Ignore.
      }
    }

    return false;
  }
}

module.exports = tryGitInit;
