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
    './test/test.config.js' //Our starting point for our testing.
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
    { test: require.resolve("sinon"),
      loader: "expose?sinon"
     },
    { test: require.resolve("backbone"),
      loader: "expose?Backbone"
    },
    {
      test: require.resolve("react"),
      loader: "imports?shim=es5-shim/es5-shim&sham=es5-shim/es5-sham"
    },
    {
      test: /\.less$/,
      loader: 'style!css!less'
    },
    { test: /\.css$/, loader: 'style!css' },
    {
      test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url?limit=10000&mimetype=application/font-woff&name=dashboard.assets/fonts/[name].[ext]'
    },
    {
      test: /\.woff2(\?\S*)?$/,   loader: 'url?limit=10000&mimetype=application/font-woff2&name=dashboard.assets/fonts/[name].[ext]'
    },
    {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,    loader: 'url?limit=10000&mimetype=application/font-tff&name=dashboard.assets/fonts/[name].[ext]'
    },
    { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,    loader: 'file?name=dashboard.assets/fonts/[name].[ext]' },
    { test: /\.swf(\?v=\d+\.\d+\.\d+)?$/,    loader: 'file?name=dashboard.assets/[name].[ext]' },
    { test: /\.png(\?v=\d+\.\d+\.\d+)?$/,    loader: 'file?name=dashboard.assets/img/[name].[ext]' },
    { test: /\.gif(\?v=\d+\.\d+\.\d+)?$/,    loader: 'file?name=dashboard.assets/img/[name].[ext]' },
    { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,    loader: 'url?limit=10000&mimetype=image/svg+xml&name=dashboard.assets/img/[name].[ext]' }
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
    path: __dirname + '/test',
    filename: 'bundle.js' //All our code is compiled into a single file called bundle.js
  },
  externals: { //for webpack to play nice with enzyme
    "jsdom": "window",
    "cheerio": "window",
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': 'window',
    'react/addons': true
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1})
  ]
};
