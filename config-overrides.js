const { merge } = require('webpack-merge');
const path = require('path');

const publicPath =
  process.env.NODE_ENV === 'production'
    ? process.env.NETLIFY
      ? '/'
      : '/tempExhibit'
    : '';

process.env.PUBLIC_URL = publicPath;

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
    publicPath,
  },
};

module.exports = function override(config) {
  return merge(config, extendWebpackConfig);
};
