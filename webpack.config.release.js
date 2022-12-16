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
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const path = require('path');
const settings = require('./tasks/helper')
  .init()
  .readSettingsFile()
  .template
  .release;

module.exports = {

  mode: 'production',

  // Entry point for static analyzer:
  entry: {
    bundle: ['core-js/features/array', 'core-js/features/string/ends-with', 'core-js/features/string/starts-with',  'core-js/features/object', 'core-js/features/symbol', 'core-js/features/promise', 'regenerator-runtime/runtime', './app/main.js']
  },

  output: {
    path: path.join(__dirname, '/dist/release/'),
    filename: 'dashboard.assets/js/[name].[chunkhash].js',
    chunkFilename: 'dashboard.assets/js/[name].[chunkhash].js'
  },

  plugins: [
    // moment doesn't offer a modular API, so manually remove locale
    // see https://github.com/moment/moment/issues/2373
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    new ESLintPlugin({
      extensions: [`js`, `jsx`],
    }),
    new HtmlWebpackPlugin(Object.assign({
      template: settings.src,
      title: 'Project Fauxton',
      filename: 'index.html',
      generationLabel: 'Fauxton Release',
      generationDate: new Date().toISOString()
    }, settings.variables)),
    new MiniCssExtractPlugin({
      filename: 'dashboard.assets/css/styles.[chunkhash].css',
      chunkFilename: 'dashboard.assets/css/styles.[chunkhash].css'
    })
  ],

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'initial',
          name: 'vendor',
          priority: 10,
          enforce: true
        },
      }
    },
    runtimeChunk: {
      name: "manifest",
    }
  },

  resolve: {
    extensions: ['*', '.js', '.jsx'],
    alias: {
      "underscore": "lodash"
    }
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: ['/node_modules/'],
        use: [{
          loader: 'babel-loader'
        }],
      },
      {
        test: require.resolve('jquery'),
        use: [{
          loader: 'expose-loader',
          options: {
            exposes: ['jQuery', '$'],
          },
        }]
      },
      {
        test: require.resolve("backbone"),
        use: [{
          loader: 'expose-loader',
          options: {
            exposes: [{
              globalName: 'Backbone',
              override: true,
            }],
          },
        }]
      },
      {
        test: /\.less/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../../'
            },
          },
          "css-loader",
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                modifyVars: {
                  largeLogoPath: "'" + settings.variables.largeLogoPath + "'",
                  smallLogoPath: "'" + settings.variables.smallLogoPath + "'"
                }
              }
            }
          }
        ]
      },
      {
        test: /\.css$/, use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../../'
            },
          },
          'css-loader'
        ]
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'dashboard.assets/fonts/[name][ext]'
        },
      },
      {
        test: /\.woff2(\?\S*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'dashboard.assets/fonts/[name][ext]'
        },
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'dashboard.assets/fonts/[name][ext]'
        },
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'dashboard.assets/fonts/[name][ext]'
        },
      },
      {
        test: /\.png(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'dashboard.assets/img/[name][ext]'
        },
      },
      {
        test: /\.gif(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'dashboard.assets/img/[name][ext]'
        }
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'dashboard.assets/img/[name][ext]'
        },
      }
    ]
  }
};
