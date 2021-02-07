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
  output: {
    publicPath:
      process.env.NODE_ENV === 'production'
        ? process.env.NETLIFY
          ? '/'
          : '/tempExhibit'
        : '',
  },
};

module.exports = function override(config) {
  return merge(config, extendWebpackConfig);
};
