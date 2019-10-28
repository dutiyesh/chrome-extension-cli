'use strict';

const merge = require('webpack-merge');

const getCommonConfig = require('./webpack.common.js');
const PATHS = require('./paths');

module.exports = env => {
  // Merge webpack configuration files
  return merge(getCommonConfig(env), {
    entry: {
      popup: PATHS.src + '/popup.js',
      contentScript: PATHS.src + '/contentScript.js',
      background: PATHS.src + '/background.js',
    },
  });
}
