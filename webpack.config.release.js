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
  // Entry point for static analyzer:
  entry: [
    './app/main.js'
  ],

  output: {
    path: path.join(__dirname, '/dist/release'),
    filename: 'bundle.js'
  },

  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 2}),
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
    extensions: ['', '.js', '.jsx'],
    alias: {
      "underscore": "lodash",
      "bootstrap": "../assets/js/libs/bootstrap",
    }
  }
};
