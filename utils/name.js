'use-strict';

const chalk = require('chalk');
const validateProjectName = require('validate-npm-package-name');

function prettifyAppName(name) {
  return name
    .replace(/-/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => word.substring(0, 1).toUpperCase() + word.substring(1))
    .join(' ');
}

// Source: https://github.com/facebook/create-react-app/blob/master/packages/create-react-app/createReactApp.js#L713
function checkAppName(name) {
  const validationResult = validateProjectName(name);
  if (!validationResult.validForNewPackages) {
    console.error(
      `Could not create a project called ${chalk.red(
        `"${name}"`
      )} because of npm naming restrictions:`
    );
    printValidationResults(validationResult.errors);
    printValidationResults(validationResult.warnings);
    process.exit(1);
  }
}

function printValidationResults(results) {
  if (typeof results !== 'undefined') {
    results.forEach((error) => {
      console.error(chalk.red(`  *  ${error}`));
    });
  }
}

module.exports = {
  checkAppName,
  prettifyAppName,
};
