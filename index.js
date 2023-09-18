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

let projectName;
const LANGUAGES = ['javascript', 'typescript'];
const OVERRIDE_PAGES = ['newtab', 'bookmarks', 'history'];
const TS_CONFIG = {
  compilerOptions: {
    rootDir: 'src',
    target: 'es6',
    module: 'commonjs',
    esModuleInterop: true,
    strict: true,
  },
};

const program = new commander.Command(packageFile.name)
  .version(packageFile.version)
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action((name) => {
    projectName = name;
  })
  .option(
    '--override-page [page-name]',
    'override default page like New Tab, Bookmarks, or History page'
  )
  .option('--devtools', 'add features to Chrome Developer Tools')
  .option('--side-panel', 'add features to Chrome Side Panel')
  .option(
    '--language [language-name]',
    'language like JavaScript and TypeScript'
  )
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

function isLanguageNameValid(name) {
  if (name === true || LANGUAGES.includes(name)) {
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

function logLanguageError() {
  console.error(
    `${chalk.red('Invalid language name passed to option:')} ${chalk.cyan(
      '--language'
    )}`
  );
  console.log();
  console.log(
    `You can pass language name as ${chalk.cyan('javascript')} or ${chalk.cyan(
      'typescript'
    )}.`
  );
  console.log();
  console.log('For example:');
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green(
      'my-extension'
    )} ${chalk.cyan('--language')} ${chalk.green('typescript')}`
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

function createExtension(
  name,
  { overridePage, devtools, sidePanel, language }
) {
  const root = path.resolve(name);
  let overridePageName;
  let languageName = 'javascript';

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

  if (language) {
    if (isLanguageNameValid(language)) {
      languageName = language === true ? 'javascript' : language;
    } else {
      logLanguageError();
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
  let appPackage = Object.assign(
    {},
    {
      name: name,
    },
    appDetails,
    {
      private: true,
    }
  );

  appPackage.scripts = {
    watch:
      'webpack --mode=development --watch --config config/webpack.config.js',
    build: 'webpack --mode=production --config config/webpack.config.js',
    pack: 'node pack.js',
    repack: 'npm run build && npm run pack',
    format:
      'prettier --write --ignore-unknown "{config,public,src}/**/*.{html,css,js,ts,json}"',
  };

  // Create package file in project directory
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(appPackage, null, 2)
  );

  // Create tsconfig file in project directory
  if (languageName === 'typescript') {
    fs.writeFileSync(
      path.join(root, 'tsconfig.json'),
      JSON.stringify(TS_CONFIG, null, 2)
    );
  }

  let command = 'npm';
  let args = ['install', '--save-dev'];

  // Add devDependencies
  args.push(
    'webpack@^5.72.0',
    'webpack-cli@^4.9.2',
    'webpack-merge@^5.8.0',
    'copy-webpack-plugin@^10.2.4',
    'mini-css-extract-plugin@^2.6.0',
    'css-loader@^6.7.1',
    'file-loader@^6.2.0',
    'prettier@^2.6.2',
    'adm-zip@^0.5.10'
  );

  if (languageName === 'typescript') {
    args.push('typescript@4.6.3', 'ts-loader@9.2.8', '@types/chrome@0.0.181');
  }

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
  } else if (sidePanel) {
    templateName = 'side-panel';
  } else {
    templateName = 'popup';
  }

  fs.copySync(
    path.resolve(__dirname, 'templates', languageName, templateName),
    root
  );

  // Copy common files between languages
  fs.copySync(
    path.resolve(__dirname, 'templates', 'shared', templateName),
    root
  );

  fs.copySync(
    path.resolve(__dirname, 'config', languageName),
    path.join(root, 'config')
  );

  // Copy common webpack configuration file
  fs.copySync(
    path.resolve(__dirname, 'config', 'shared'),
    path.join(root, 'config')
  );

  // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
  // See: https://github.com/npm/npm/issues/1862
  // Source: https://github.com/facebook/create-react-app/blob/47e9e2c7a07bfe60b52011cf71de5ca33bdeb6e3/packages/react-scripts/scripts/init.js#L138
  // Also followed same convention for other dotfiles.
  const dotFilesSource = path.resolve(
    __dirname,
    'templates',
    'shared',
    'dotfiles'
  );

  fs.readdirSync(dotFilesSource).map(function (fileName) {
    return fs.copyFileSync(
      path.join(dotFilesSource, fileName),
      path.join(root, '.' + fileName)
    );
  });

  // Copy script to automatically generate zip file
  fs.copyFileSync(
    path.resolve(__dirname, 'templates', 'shared', 'pack.js'),
    path.join(root, 'pack.js')
  );

  // Setup the manifest file
  const manifestDetails = Object.assign(
    {},
    {
      name: prettifyAppName(name),
    },
    appDetails
  );

  let appManifest = Object.assign(
    {},
    {
      manifest_version: 3,
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
        service_worker: 'background.js',
      },
    }
  );

  if (overridePageName) {
    appManifest = Object.assign({}, appManifest, {
      chrome_url_overrides: {
        [overridePageName]: 'index.html',
      },
    });
  } else if (devtools) {
    appManifest = Object.assign({}, appManifest, {
      devtools_page: 'devtools.html',
    });
  } else if (sidePanel) {
    appManifest = Object.assign({}, appManifest, {
      side_panel: {
        default_path: 'sidepanel.html',
      },
      permissions: ['sidePanel', 'tabs'],
    });
  } else {
    appManifest = Object.assign({}, appManifest, {
      action: {
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
    });
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
  console.log(chalk.cyan(`  ${command} run format`));
  console.log('    Formats all the files.');
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
  sidePanel: program.sidePanel,
  language: program.language,
});
