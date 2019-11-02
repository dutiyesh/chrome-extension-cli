'use strict';

const SizePlugin = require('size-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const PATHS = require('./paths');

module.exports = env => {
  // To re-use webpack configuration across templates,
  // CLI maintains a common webpack configuration file - `webpack.common.js`.
  // Whenever user creates an extension, CLI adds `webpack.common.js` file
  // in template's `config` folder
  const crossBrowser = (env.CROSS_BROWSER === 'true');
  const common = {
    output: {
      // the build folder to output bundles and assets in.
      path: PATHS.build,
      // the filename template for entry chunks
      filename: '[name].js',
    },
    devtool: 'source-map',
    stats: {
      all: false,
      errors: true,
      builtAt: true,
    },
    module: {
      rules: [
        // Help webpack in understanding CSS files imported in .js files
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        // Check for images imported in .js files and
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                outputPath: 'images',
                name: '[name].[ext]',
              },
            },
          ],
        },
      ],
    },
    plugins: [
      // Print file sizes
      new SizePlugin(),
      // Copy static assets from `public` folder to `build` folder, except .html files
      new CopyWebpackPlugin([
        {
          from: '**/*',
          context: 'public',
          ignore: ['*.html']
        },
      ]),
      // copy static .html files from `public` folder to `build` folder, and replace the `<%= browser-polyfill %>` variable depending on config
      new CopyWebpackPlugin([
        {
          from: '**/*.html',
          context: 'public',
          transform: (content) => {
            const polyfill = '<script type="application/javascript" src="browser-polyfill.min.js"></script>';
            if(crossBrowser) {
              return content.toString().replace('<%= browser-polyfill %>', polyfill);
            }
            return content.toString().replace('<%= browser-polyfill %>', '');
          }
        },
      ]),
      // Extract CSS into separate files
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
    ],
  };

  if(crossBrowser) {
    // Copy browser-polyfill.js for cross browser compability
    common.plugins.unshift(new CopyWebpackPlugin([
      {
        from: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
      }
    ]));
  }
  return common;
}
