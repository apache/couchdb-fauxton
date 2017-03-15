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
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    bundle: './app/main.js' //Our starting point for our development.
  },

  output: {
    path: path.join(__dirname, '/dist/debug/'),
    filename: 'dashboard.assets/js/[name].js'
  },

  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
    new HtmlWebpackPlugin({
      template: './assets/index.underscore', // Load a custom template (ejs by default see the FAQ for details)
      title: 'Project Fauxton',
      filename: 'index.html',
      development: true,
      generationLabel: 'Fauxton Dev',
      generationDate: new Date().toISOString()
    }),
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
     test: require.resolve('jquery'),
      use: [{
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
    { test: /\.swf(\?v=\d+\.\d+\.\d+)?$/,    loader: 'file-loader?name=dashboard.assets/[name].[ext]' },
    { test: /\.png(\?v=\d+\.\d+\.\d+)?$/,    loader: 'file-loader?name=dashboard.assets/img/[name].[ext]' },
    { test: /\.gif(\?v=\d+\.\d+\.\d+)?$/,    loader: 'file-loader?name=dashboard.assets/img/[name].[ext]' },
    { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,    loader: 'url-loader?limit=10000&mimetype=image/svg+xml&name=dashboard.assets/img/[name].[ext]' }
  ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'], //We can use .js and React's .jsx files using Babel
    alias: {
      "bootstrap": "../assets/js/libs/bootstrap",
      "underscore": "lodash",
    }
  },
  devtool: 'source-map'
};
