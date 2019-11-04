'use strict';

const merge = require('webpack-merge');

const getCommonConfig = require('./webpack.common.js');
const PATHS = require('./paths');

module.exports = env => {
  // Merge webpack configuration files
  return merge(getCommonConfig(env), {
    entry: {
      app: PATHS.src + '/app.js',
      background: PATHS.src + '/background.js',
    },
  });
}
