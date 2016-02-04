var webpack = require('webpack');
var path = require('path');

module.exports = {
  // Entry point for static analyzer:
  entry: [
    './app/main.js'
  ],

  output: {
    path: path.join(__dirname, '/dist/tmp-out'),
    filename: 'bundle.js'
  },

  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production') // This has effect on the react lib size
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })

  ],

  resolve: {
    // Allow to omit extensions when requiring these files
    extensions: ['', '.js', '.jsx']
  },

  module: {
    preLoaders: [
      {
        test: /\.jsx?$/,
        loaders: ['eslint'],
        exclude: /node_modules/
      }
    ],
    loaders: [
    {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      //loader: 'react-hot!babel'
      loader: 'babel'
    },
    { test: require.resolve("jquery"),
      loader: "expose?$!expose?jQuery"
     },
    { test: require.resolve("backbone"),
      loader: "expose?Backbone"
    }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      "underscore": "lodash",
      "bootstrap": "../assets/js/libs/bootstrap",
    }
  },
  devtool: 'source-map',
};
