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
  .parse(process.argv);

// Exit from the process if no project name is provided
if (typeof projectName === 'undefined') {
  console.error('Please specify the project directory');
  process.exit(1);
}

console.log('The CLI for your next Chrome Extension. 🚀');
console.log(`Project name: ${projectName}`);
