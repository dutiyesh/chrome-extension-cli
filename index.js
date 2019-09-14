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

console.log('The CLI for your next Chrome Extension. 🚀');
console.log(`Poject name: ${projectName}`);
