#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const spawn = require('cross-spawn');
const commander = require('commander');

const packageFile = require('./package.json');
const { checkAppName, prettifyAppName } = require('./utils/name');
const generateReadme = require('./scripts/readme');
const tryGitInit = require('./scripts/git-init');
const browserPolyfillFilename = 'browser-polyfill.min.js';

let projectName;
const OVERRIDE_PAGES = ['newtab', 'bookmarks', 'history'];

const program = new commander.Command(packageFile.name)
  .version(packageFile.version)
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action(name => {
    projectName = name;
  })
  .option(
    '--override-page [page-name]',
    'override default page like New Tab, Bookmarks, or History page'
  )
  .option('--devtools', 'add features to Chrome Developer Tools')
  .option('--no-cross-browser', `the generated project will not be cross-browser compatible`)
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

function isOverridePageNameValid(name) {
  if (name === true || OVERRIDE_PAGES.includes(name)) {
    return true;
  }

  return false;
}

function logOverridePageError() {
  console.error(
    `${chalk.red('Invalid page name passed to option:')} ${chalk.cyan(
      '--override-page'
    )}`
  );
  console.log();
  console.log(
    `You can pass page name as ${chalk.cyan('newtab')}, ${chalk.cyan(
      'bookmarks'
    )} or ${chalk.cyan('history')}.`
  );
  console.log();
  console.log('For example:');
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green(
      'my-extension'
    )} ${chalk.cyan('--override-page')} ${chalk.green('newtab')}`
  );
  process.exit(1);
}

function logOptionsConflictError() {
  console.error(
    `${chalk.red(
      'You have passed both "--override-page" and "--devtools" options'
    )}`
  );
  console.log(`  ${chalk.cyan('Only pass one of the option')}`);
  console.log('');
  process.exit(1);
}

function createExtension(name, { overridePage, devtools, crossBrowser }) {
  const root = path.resolve(name);
  let overridePageName;

  if (overridePage) {
    if (isOverridePageNameValid(overridePage)) {
      overridePageName = overridePage === true ? 'newtab' : overridePage;

      if (devtools) {
        logOptionsConflictError();
      }
    } else {
      logOverridePageError();
    }
  }

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
      `webpack --mode=development --env.CROSS_BROWSER=${crossBrowser} --watch --config config/webpack.config.js`,
    build: `webpack --mode=production --env.CROSS_BROWSER=${crossBrowser} --config config/webpack.config.js`,
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
    'file-loader',
    'webextension-polyfill'
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
  let templateName;
  if (overridePageName) {
    templateName = 'override-page';
  } else if (devtools) {
    templateName = 'devtools';
  } else {
    templateName = 'popup';
  }

  const files = [];
  fs.copySync(path.resolve(__dirname, 'templates', templateName), root, {
    filter: filename => {
      if(!/\.js$/.test(filename)) return true; // copy all files that aren't .js files
      if(/^webpack\.config\.js$/.test(filename)) return true; // explcitly copy webpack.config.js all the time
      if(!crossBrowser && filename.indexOf('.nocrossbrowser') > -1) {
        files.push(filename);
        return true;
      } else if(crossBrowser && filename.indexOf('.nocrossbrowser') === -1) {
        return true;
      }
      return false;
    }
  });

  // if the webextenstion support is not enabled, we need to copy the template files with .nocrosbbrowser.js ending
  // but after that, these files are renamed and the .nocrosbbrowser extension is removed
  if(!crossBrowser) {
    files.forEach(file => {
      const { base } = path.parse(file);
      let srcPath = path.resolve(root, 'src', base);
      let destPath = path.resolve(root, 'src', base.replace('.nocrossbrowser', ''));
      fs.moveSync(srcPath, destPath);
    });
  }

  // Copy common webpack configuration file
  fs.copySync(path.resolve(__dirname, 'config'), path.join(root, 'config'));

  // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
  // See: https://github.com/npm/npm/issues/1862
  // Source: https://github.com/facebook/create-react-app/blob/47e9e2c7a07bfe60b52011cf71de5ca33bdeb6e3/packages/react-scripts/scripts/init.js#L138
  fs.moveSync(
    path.join(root, 'gitignore'),
    path.join(root, '.gitignore'),
    []
  );

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
    background: {
      scripts: ['background.js'],
      persistent: false,
    },
  };

  if (overridePageName) {
    appManifest = {
      ...appManifest,
      chrome_url_overrides: {
        [overridePageName]: 'index.html',
      },
    };
  } else if (devtools) {
    appManifest = {
      ...appManifest,
      devtools_page: 'devtools.html',
    };
  } else {
    appManifest = {
      ...appManifest,
      browser_action: {
        default_title: manifestDetails.name,
        default_popup: 'popup.html',
      },
      permissions: ['storage'],
      content_scripts: [
        {
          matches: ['<all_urls>'],
          run_at: 'document_idle',
          js: ['contentScript.js'],
        },
      ],
    };
  }

  if(crossBrowser) {
    appManifest.background.scripts = [browserPolyfillFilename, ...appManifest.background.scripts];
    if(appManifest.content_scripts) {
      appManifest.content_scripts.forEach(i => i.js.unshift(browserPolyfillFilename));
    }
  }

  // Create manifest file in project directory
  fs.writeFileSync(
    path.join(root, 'public', 'manifest.json'),
    JSON.stringify(appManifest, null, 2)
  );

  // Generate a README file
  if (generateReadme(manifestDetails, root)) {
    console.log('Generated a README file.');
    console.log();
  }

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

createExtension(projectName, {
  overridePage: program.overridePage,
  devtools: program.devtools,
  crossBrowser: program.crossBrowser
});
