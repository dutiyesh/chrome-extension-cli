#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const commander = require('commander');

const packageFile = require('./package.json');
const { checkAppName } = require('./utils/name');

let projectName;

const program = new commander.Command(packageFile.name)
  .version(packageFile.version)
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action(name => {
    projectName = name;
  })
  .on('--help', () => {
    console.log(`    Only ${chalk.green('<project-directory>')} is required.`);
  })
  .parse(process.argv);

// Exit from the process if no project name is provided
if (typeof projectName === 'undefined') {
  console.error('Please specify the project directory:');
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
  );
  console.log();
  console.log('For example:');
  console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-extension')}`);
  console.log();
  console.log(
    `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
  );
  process.exit(1);
}

function createExtension(name) {
  const root = path.resolve(name);

  checkAppName(name);
  fs.ensureDirSync(name);

  console.log(`Creating a new Chrome extension in ${chalk.green(root)}`);
  console.log();

  // Setup the package file
  let appPackage = {
    name: name,
    version: '0.1.0',
    description: 'My Chrome Extension',
    private: true,
  };

  // Copy package file to project directory
  // fs.writeFileSync(
  //   path.join(root, 'package.json'),
  //   JSON.stringify(appPackage, null, 2)
  // );

  // Copy template files to project directory
  fs.copySync(path.resolve(__dirname, 'templates', 'popup'), root);

  console.log(`Success! Created ${name} at ${root}`);
}

createExtension(projectName);
