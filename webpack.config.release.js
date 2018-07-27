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
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
const settings = require('./tasks/helper')
  .init()
  .readSettingsFile()
  .template
  .release;

module.exports = {
  // Entry point for static analyzer:
  entry: {
    bundle: ['core-js/fn/array', 'core-js/fn/string/ends-with', 'core-js/fn/string/starts-with',  'core-js/fn/object', 'core-js/fn/symbol', 'core-js/fn/promise', 'regenerator-runtime/runtime', './app/main.js']
  },

  output: {
    path: path.join(__dirname, '/dist/release/'),
    filename: 'dashboard.assets/js/[name].[chunkhash].js'
  },

  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production') // This has effect on the react lib size
      }
    }),
    // moment doesn't offer a modular API, so manually remove locale
    // see https://github.com/moment/moment/issues/2373
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: true
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor', // Specify the common bundle's name.
      minChunks: function (module) {
        // this assumes your vendor imports exist in the node_modules directory
        return module.context && module.context.indexOf('node_modules') !== -1;
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "manifest",
      minChunks: Infinity
    }),
    new HtmlWebpackPlugin(Object.assign({
      template: settings.src,
      title: 'Project Fauxton',
      filename: 'index.html',
      generationLabel: 'Fauxton Release',
      generationDate: new Date().toISOString()
    }, settings.variables)),
    new ExtractTextPlugin("dashboard.assets/css/styles.[chunkhash].css"),
  ],

  resolve: {
    extensions: ['*', '.js', '.jsx'],
    alias: {
      "underscore": "lodash"
    }
  },

  module: {
    loaders: [{
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
      test: /\.less/,
      use: ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: [
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
        ],
        publicPath: '../../'
      }),
    },
    {
      test: /\.css$/, use: [
        'style-loader',
        'css-loader'
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
  }
};
