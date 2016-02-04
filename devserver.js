var spawn = require('child_process').spawn;
var path = require("path");
var _ = require('lodash');
var webpack = require('webpack');
var WebpackDev = require('webpack-dev-server');

var config = require('./webpack.config.dev.js');

var less = function () {
  var _less = spawn('npm', ['run', 'build:less:debug']);

  _less.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  _less.stderr.on('error', (data) => {
    console.log('less error:', data.toString());
  });

  _less.on('close', (code) => {
    console.log(`less compile finished with code ${code}`);
  });
};

var devSetup = function (cb) {
  console.log('setup dev environment');
  var grunt = spawn('grunt', ['devSetup']);

  grunt.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  grunt.stderr.on('error', (data) => {
    console.log('Setup error:', data.toString());
  });

  grunt.on('close', (code) => {
    console.log('dev setup finished with code', code);
    if (code === 0) {
      cb();
    }
  });
};

var headerValue = "default-src 'self'; child-src 'self' data: blob:; img-src 'self' data:; font-src 'self'; " +
                  "script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";
var setCSP = function (res) {
  res.setHeader('Content-Security-Policy', headerValue);
};

var runWebpackServer = function () {
  var fileTypes = ['.js', '.css', '.png', '.swf', '.eot', '.woff', '.svg', '.ttf', '.swf'];
  function isFile (url) {
    return _.contains(fileTypes, path.extname(url));
  }

  var options = {
    contentBase: __dirname + '/dist/debug',
    publicPath: '/',
    outputPath: '/',
    filename: 'bundle.js',
    host: 'localhost',
    port: process.env.FAUXTON_PORT || 8000,
    hot: false,
    historyApiFallback: true,
    proxy: {
      '*': {
        target: 'http://127.0.0.1:5984',
        secure: false,
        bypass: function (req, res) {
          setCSP(res);
          //requests for certain assets requires us to skip the proxy.
          var url = req.url.split('?')[0];
          if (isFile(url)) {
            return url;
          }

          if (req.headers.accept.indexOf('html') !== -1) {
            return '/index.html';
          }

          if (req.url.indexOf('templates.js') !== -1) {
            return '/templates.js';
          }
        }
      }
    },
    stats: {
      colors: true,
    }
  };

  var compiler = webpack(config);

  compiler.plugin('done', function () {
    console.log('Bundled done!');
    console.log('Compiling less');
    less();
  });

  new WebpackDev(compiler, options).listen(options.port, options.host, function (err) {
    if (err) {
      console.log(err);
      return;
    }
    console.log('listening on', options.host, options.port);
    console.log('Starting first compile. This will take about 10 seconds...');
  });
};

devSetup(runWebpackServer);
