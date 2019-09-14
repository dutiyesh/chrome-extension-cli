#!/usr/bin/env node

'use strict';

const commander = require('commander');

const program = new commander.Command('chrome-extension-cli')
  .version('0.1.0')
  .parse(process.argv);

console.log('The CLI for your next Chrome Extension. 🚀');
