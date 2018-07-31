const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: 'bundle.min.js',
    path: path.resolve(__dirname, 'dist/js'),
  },
});
