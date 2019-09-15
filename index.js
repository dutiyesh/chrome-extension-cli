#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const spawn = require('cross-spawn');
const commander = require('commander');

const packageFile = require('./package.json');
const { checkAppName, prettifyAppName } = require('./utils/name');
const tryGitInit = require('./scripts/git-init');

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

  const appDetails = {
    version: '0.1.0',
    description: 'My Chrome Extension',
  };

  // Setup the package file
  let appPackage = {
    name: name,
    ...appDetails,
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

  // Setup the manifest file
  const manifestDetails = {
    name: prettifyAppName(name),
    ...appDetails,
  };

  let appManifest = {
    manifest_version: 2,
    ...manifestDetails,
    icons: {
      16: 'icons/icon_16.png',
      32: 'icons/icon_32.png',
      48: 'icons/icon_48.png',
      128: 'icons/icon_128.png',
    },
    browser_action: {
      default_title: manifestDetails.name,
      default_popup: 'popup.html',
    },
    permissions: ['storage'],
  };

  // Create manifest file in project directory
  fs.writeFileSync(
    path.join(root, 'public', 'manifest.json'),
    JSON.stringify(appManifest, null, 2)
  );

  // Initialize a git repository
  if (tryGitInit(root, name)) {
    console.log('Initialized a git repository.');
    console.log();
  }

  console.log(`Success! Created ${name} at ${root}`);
  console.log('Inside that directory, you can run below commands:');
  console.log();
  console.log(chalk.cyan(`  ${command} run watch`));
  console.log('    Listens for files changes and rebuilds automatically.');
  console.log();
  console.log(chalk.cyan(`  ${command} run build`));
  console.log('    Bundles the app into static files for Chrome store.');
  console.log();
  console.log('We suggest that you begin by typing:');
  console.log();
  console.log(`  1. ${chalk.cyan('cd')} ${name}`);
  console.log(`  2. Run ${chalk.cyan(`${command} run watch`)}`);
  console.log(`  3. Open ${chalk.cyan('chrome://extensions')}`);
  console.log(`  4. Check the ${chalk.cyan('Developer mode')} checkbox`);
  console.log(
    `  5. Click on the ${chalk.cyan('Load unpacked extension')} button`
  );
  console.log(`  6. Select the folder ${chalk.cyan(name + '/build')}`);
  console.log();
}

createExtension(projectName);
