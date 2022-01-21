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
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const settings = require('./tasks/helper')
  .init()
  .readSettingsFile()
  .template
  .development;

module.exports = {

  mode: 'development',

  entry: {
    bundle: ['core-js/fn/array', 'core-js/fn/string/ends-with', 'core-js/fn/string/starts-with', 'core-js/fn/object', 'core-js/fn/symbol', 'core-js/fn/promise', 'regenerator-runtime/runtime', './app/main.js'] //Our starting point for our development.
  },

  output: {
    path: path.join(__dirname, '/dist/debug/'),
    filename: 'dashboard.assets/js/[name].js'
  },

  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
    new HtmlWebpackPlugin(Object.assign({
      template: settings.src,
      title: 'Project Fauxton',
      filename: 'index.html',
      generationLabel: 'Fauxton Dev',
      generationDate: new Date().toISOString()
    }, settings.variables)),
    new MiniCssExtractPlugin({
      filename: 'dashboard.assets/css/styles.[chunkhash].css',
      chunkFilename: 'dashboard.assets/css/styles.[chunkhash].css'
    })
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
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../../',
              hmr: false,
            },
          },
          "css-loader",
          {
            loader: "less-loader",
            options: {
              modifyVars: {
                largeLogoPath: "'" + settings.variables.largeLogoPath + "'",
                smallLogoPath: "'" + settings.variables.smallLogoPath + "'"
              }
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../../',
              hmr: false,
            },
          },
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
      "underscore": "lodash",
    }
  },
  devtool: 'source-map'
};
