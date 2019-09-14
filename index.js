#!/usr/bin/env node

'use strict';

const commander = require('commander');

let projectName;

const program = new commander.Command('chrome-extension-cli')
  .version('0.1.0')
  .arguments('<project-directory>')
  .usage('<project-directory> [options]')
  .action(name => {
    projectName = name;
  })
  .on('--help', () => {
    console.log(`    Only <project-directory> is required.`);
  })
  .parse(process.argv);

// Exit from the process if no project name is provided
if (typeof projectName === 'undefined') {
  console.error('Please specify the project directory:');
  console.log(`  ${program.name()} <project-directory>`);
  console.log();
  console.log('For example:');
  console.log(`  ${program.name()} my-extension`);
  console.log();
  console.log(`Run ${program.name()} --help to see all options.`);
  process.exit(1);
}

console.log('The CLI for your next Chrome Extension. 🚀');
console.log(`Project name: ${projectName}`);
