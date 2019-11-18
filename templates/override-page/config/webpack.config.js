'use strict';

const merge = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = merge(common, {
  entry: {
    app: PATHS.src + '/app',
    background: PATHS.src + '/background',
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
});

module.exports = config;
