var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  // Entry point for static analyzer:
  entry: [
    './src/client.js'
  ],

  output: {
    // Where to put build results when doing production builds:
    // (Server doesn't write to the disk, but this is required.)
    path: __dirname + "/dist",

    // Filename to use in HTML
    filename: 'js/main.js'
  },
  resolve: {
    // Allow to omit extensions when requiring these files
    extensions: ['', '.js']
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new ExtractTextPlugin("css/style.css")
  ],
  module: {
    loaders: [
      // Pass *.jsx files through jsx-loader transform
      {
        test: /\.js?$/,
        loaders: ['jsx?harmony'],
        exclude: /node_modules[\\\/]react(-router)?[\\\/]/
      },
      { test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader") }
    ]
  },
  devtool: "#inline-source-map",
  debug: true
};
