var webpack = require('webpack');
var path = require('path');

module.exports = {
  // Entry point for static analyzer:
  entry: [
    './client.js'
  ],

  output: {
    // Where to put build results when doing production builds:
    // (Server doesn't write to the disk, but this is required.)
    path: __dirname + "/dist/js",

    // Filename to use in HTML
    filename: 'main.js'
  },
  resolve: {
    // Allow to omit extensions when requiring these files
    extensions: ['', '.js']
  },
  plugins: [
    new webpack.optimize.DedupePlugin()
  ],


  module: {
    loaders: [
      // Pass *.jsx files through jsx-loader transform
      {
        test: /\.js?$/,
        loaders: ['jsx?harmony'],
        exclude: /node_modules[\\\/]react(-router)?[\\\/]/
      }
    ]
  },
  devtool: "#inline-source-map",
};
