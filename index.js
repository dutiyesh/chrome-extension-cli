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

let projectName;
const OVERRIDE_PAGES = ['newtab', 'bookmarks', 'history'];

function isOverridePageNameValid(name) {
  if (name === true || OVERRIDE_PAGES.includes(name)) {
    return true;
  }

  return false;
}

function logOverridePageError(outputFunc) {
  console.error(
    `${chalk.red('Invalid page name passed to option:')} ${chalk.cyan(
      '--override-page'
    )}`
  );
  outputFunc("");
  outputFunc(
    `You can pass page name as ${chalk.cyan('newtab')}, ${chalk.cyan(
      'bookmarks'
    )} or ${chalk.cyan('history')}.`
  );
  outputFunc("");
  outputFunc('For example:');
  outputFunc(
    `  ${chalk.cyan(program.name())} ${chalk.green(
      'my-extension'
    )} ${chalk.cyan('--override-page')} ${chalk.green('newtab')}`
  );
  process.exit(1);
}

function logOptionsConflictError(outputFunc) {
  console.error(
    `${chalk.red(
      'You have passed both "--override-page" and "--devtools" options'
    )}`
  );
  outputFunc(`  ${chalk.cyan("Only pass one of the option")}`);
  outputFunc("");
  process.exit(1);
}

function createExtension(name, { overridePage, devtools }, dirPath, outputFunc=console.log) {
  const root = path.join(dirPath, name);
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
  fs.ensureDirSync(path.join(dirPath, name));

  outputFunc(`Creating a new Chrome extension in ${chalk.green(root)}`);
  outputFunc("");

  const appDetails = {
    version: '0.1.0',
    description: 'My Chrome Extension',
  };

  // Setup the package file
  let appPackage = Object.assign(
    {},
    {
      name: name,
    },
    appDetails,
    {
      $schema: "https://json.schemastore.org/chrome-manifest.json",
      private: true,
    }
  );

  appPackage.scripts = {
    watch: "webpack --mode=development --watch --config config/webpack.config.js",
    build: "webpack --mode=production --config config/webpack.config.js"
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
    'webpack@^4.0.0',
    'webpack-cli@^3.0.0',
    'webpack-merge@^5.0.0',
    'copy-webpack-plugin@^6.0.0',
    'size-plugin@^2.0.0',
    'mini-css-extract-plugin@^0.10.0',
    'css-loader@^4.0.0',
    'file-loader@^6.0.0'
  );

  outputFunc('Installing packages. This might take a couple of minutes.');
  outputFunc(
    `Installing ${chalk.cyan('webpack')}, ${chalk.cyan(
      'webpack-cli'
    )} and few more...`
  );
  outputFunc("");

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

  fs.copySync(path.resolve(__dirname, 'templates', templateName), root);

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
  const manifestDetails = Object.assign(
    {},
    {
      name: prettifyAppName(name),
    },
    appDetails,
  );

  let appManifest = Object.assign(
    {},
    {
      manifest_version: 2,
    },
    manifestDetails,
    {
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
    }
  );

  if (overridePageName) {
    appManifest = Object.assign(
      {},
      appManifest,
      {
        chrome_url_overrides: {
          [overridePageName]: 'index.html',
        },
      },
    );
  } else if (devtools) {
    appManifest = Object.assign(
      {},
      appManifest,
      {
        devtools_page: 'devtools.html',
      },
    );
  } else {
    appManifest = Object.assign(
      {},
      appManifest,
      {
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
      }
    );
  }

  // Create manifest file in project directory
  fs.writeFileSync(
    path.join(root, 'public', 'manifest.json'),
    JSON.stringify(appManifest, null, 2)
  );

  // Generate a README file
  if (generateReadme(manifestDetails, root)) {
    outputFunc('Generated a README file.');
    outputFunc("");
  }

  // Initialize a git repository
  if (tryGitInit(root, name)) {
    outputFunc('Initialized a git repository.');
    outputFunc("");
  }

  outputFunc(`Success! Created ${name} at ${root}`);
  outputFunc('Inside that directory, you can run below commands:');
  outputFunc("");
  outputFunc(chalk.cyan(`  ${command} run watch`));
  outputFunc('    Listens for files changes and rebuilds automatically.');
  outputFunc("");
  outputFunc(chalk.cyan(`  ${command} run build`));
  outputFunc('    Bundles the app into static files for Chrome store.');
  outputFunc("");
  outputFunc('We suggest that you begin by typing:');
  outputFunc("");
  outputFunc(`  1. ${chalk.cyan('cd')} ${name}`);
  outputFunc(`  2. Run ${chalk.cyan(`${command} run watch`)}`);
  outputFunc(`  3. Open ${chalk.cyan('chrome://extensions')}`);
  outputFunc(`  4. Check the ${chalk.cyan('Developer mode')} checkbox`);
  outputFunc(
    `  5. Click on the ${chalk.cyan('Load unpacked extension')} button`
  );
  outputFunc(`  6. Select the folder ${chalk.cyan(name + '/build')}`);
  outputFunc("");
}

module.exports = { isOverridePageNameValid, logOverridePageError, logOptionsConflictError, createExtension};