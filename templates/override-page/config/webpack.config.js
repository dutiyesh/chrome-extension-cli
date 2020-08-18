'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = merge(common, {
  entry: {
    app: PATHS.src + '/app.js',
    background: PATHS.src + '/background.js',
  },
});

module.exports = config;
