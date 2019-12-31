'use strict';
const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

const plugins =
  process.env.NODE_ENV === 'production'
    ? [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new UglifyJSPlugin(),
        new ManifestPlugin(),
      ]
    : [new ManifestPlugin()];

module.exports = {
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
  mode: process.env.NODE_ENV || 'development',
  entry: './dist-client/entrypoint.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename:
      process.env.NODE_ENV === 'production'
        ? 'components.[contenthash].js'
        : 'components.js',
    publicPath: '/static/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'source-map-loader',
        enforce: 'pre',
      },
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader?modules&camelCase',
          'postcss-loader',
        ],
      },
      {
        test: /\.(?:png|gif)$/,
        loaders: [
          'url-loader',
          {
            loader: 'img-loader',
            options: {
              plugins: [
                require('imagemin-gifsicle'),
                require('imagemin-optipng'),
              ],
            },
          },
        ],
      },
    ],
  },
  plugins,
  resolve: {
    extensions: ['.js', '.json'],
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
  },
  externals: {
    fs: {},
  },
  performance: {
    //bye bye, FIXME...
    hints: false,
  },

  devServer: {
    contentBase: './dist',
    port: 8080,
  },
};
