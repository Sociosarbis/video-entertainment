const { merge } = require('webpack-merge');
const path = require('path');

const extendWebpackConfig = {
  resolve: {
    alias: {
      src: path.join(__dirname, 'src'),
    },
  },
  externals: {
    'hls.js': 'window.Hls',
  },
};

module.exports = function override(config) {
  return merge(config, extendWebpackConfig);
};
