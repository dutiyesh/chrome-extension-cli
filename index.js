#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const spawn = require('cross-spawn');
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

  appPackage.scripts = {
    watch:
      'webpack --mode=development --watch --config config/webpack.config.js',
    build: 'webpack --mode=production --config config/webpack.config.js',
  };

  // Create package file in project directory
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(appPackage, null, 2)
  );

  let command = 'npm';
  let args = ['install', '--save-dev'];

  // Add devDependencies
  args.push(
    'webpack',
    'webpack-cli',
    'webpack-merge',
    'copy-webpack-plugin',
    'size-plugin',
    'mini-css-extract-plugin',
    'css-loader',
    'file-loader'
  );

  console.log('Installing packages. This might take a couple of minutes.');
  console.log(
    `Installing ${chalk.cyan('webpack')}, ${chalk.cyan(
      'webpack-cli'
    )} and few more...`
  );
  console.log();

  // Install package dependencies
  const proc = spawn.sync(command, args, { cwd: root, stdio: 'inherit' });
  if (proc.status !== 0) {
    console.error(`\`${command} ${args.join(' ')}\` failed`);
    return;
  }

  // Copy template files to project directory
  fs.copySync(path.resolve(__dirname, 'templates', 'popup'), root);

  // Copy common webpack configuration file
  fs.copySync(path.resolve(__dirname, 'config'), path.join(root, 'config'));

  console.log(`Success! Created ${name} at ${root}`);
}

createExtension(projectName);
