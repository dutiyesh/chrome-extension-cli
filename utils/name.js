'use-strict';

const chalk = require('chalk');
const validateProjectName = require('validate-npm-package-name');

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
    results.forEach(error => {
      console.error(chalk.red(`  *  ${error}`));
    });
  }
}

module.exports = {
  checkAppName,
};
