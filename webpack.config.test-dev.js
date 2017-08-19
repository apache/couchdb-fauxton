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
const webpack = require('webpack');

module.exports = {
  entry: [
    'mocha-loader!./test/dev.js', //Our starting point for our testing.
  ],
  module: {
    rules: [
    {
      test: /\.jsx?$/,
      enforce: "pre",
      use: ['eslint-loader'],
      exclude: /node_modules/
    },
    {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: 'babel-loader'
    },
    {
      test: require.resolve("jquery"),
      use: [
      {
        loader: 'expose-loader',
        options: 'jQuery'
      },
      {
        loader: 'expose-loader',
        options: '$'
      }]
    },
    {
      test: require.resolve("backbone"),
      use: [{
        loader: 'expose-loader',
        options: 'Backbone'
      }]
    },
    {
      test: require.resolve("sinon"),
      use: [{
        loader: 'expose-loader',
        options: 'sinon'
      }]
    },
    {
      test: require.resolve("react"),
      loader: "imports-loader?shim=es5-shim/es5-shim&sham=es5-shim/es5-sham"
    },
    {
      test: /\.less$/,
      use: [
        "style-loader",
        "css-loader",
        "less-loader"
      ]
    },
    {
      test: /\.css$/,
      use: [
        "style-loader",
        "css-loader"
      ]
    },
    {
      test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=dashboard.assets/fonts/[name].[ext]'
    },
    {
      test: /\.woff2(\?\S*)?$/,   loader: 'url-loader?limit=10000&mimetype=application/font-woff2&name=dashboard.assets/fonts/[name].[ext]'
    },
    {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,    loader: 'url-loader?limit=10000&mimetype=application/font-tff&name=dashboard.assets/fonts/[name].[ext]'
    },
    { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,    loader: 'file-loader?name=dashboard.assets/fonts/[name].[ext]' },
    { test: /\.png(\?v=\d+\.\d+\.\d+)?$/,    loader: 'file-loader?name=dashboard.assets/img/[name].[ext]' },
    { test: /\.gif(\?v=\d+\.\d+\.\d+)?$/,    loader: 'file-loader?name=dashboard.assets/img/[name].[ext]' },
    { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,    loader: 'url-loader?limit=10000&mimetype=image/svg+xml&name=dashboard.assets/img/[name].[ext]' }
  ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'], //We can use .js and React's .jsx files using Babel
    alias: {
      "bootstrap": "../assets/js/libs/bootstrap",
      "underscore": "lodash"
      "react": "preact-compat",
      "react-dom": "preact-compat",
      "react-addons-css-transition-group": "react-transition-group",
      "create-react-class": "preact-compat/lib/create-react-class"
    }
  },
  output: {
    path: __dirname + '/test',
    filename: 'bundle.dev.js' //All our code is compiled into a single file called bundle.js
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
  ],
  devServer: {
    host: '0.0.0.0',
    port: 8001,
    historyApiFallback: {
     index: './test/dev.html'
   }
  }
};
