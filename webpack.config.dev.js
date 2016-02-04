// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.
var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: [
    './app/main.js' //Our starting point for our development.
  ],
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1})
  ],
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
    extensions: ['', '.js', '.jsx'], //We can use .js and React's .jsx files using Babel
    alias: {
      "bootstrap": "../assets/js/libs/bootstrap",
      "underscore": "lodash",
    }
  },
  output: {
    path: __dirname + '/dist/debug',
    publicPath: '/',
    filename: 'bundle.js' //All our code is compiled into a single file called bundle.js
  }
};
