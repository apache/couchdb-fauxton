var spawn = require('child_process').spawn;
var path = require("path");
var fs = require("fs");
var _ = require('lodash');
var webpack = require('webpack');
var WebpackDev = require('webpack-dev-server');
var config = require('./webpack.config.dev.js');
var httpProxy = require('http-proxy');


var loadSettings = function () {
  var fileName = './settings.json.default.json';
  if (fs.existsSync('./settings.json')) {
    fileName = './settings.json';
  }

  return require(fileName).couchserver || {
    port: process.env.FAUXTON_PORT || 8000,
    contentSecurityPolicy: true,
    proxy: {
      target: 'http://127.0.0.1:5984',
      changeOrigin: false
    }
  };
};

var settings = loadSettings();

var devSetup = function (cb) {
  console.log('setup dev environment');
  var cmd = 'devSetupWithClean';
  if (settings.noClean) {
    cmd = 'devSetup';
  }

  var grunt = spawn('grunt', [cmd]);

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

var defaultHeaderValue = "default-src 'self'; img-src 'self' data:; font-src 'self'; " +
                  "script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";
var setCSP = function (res) {
  if (!settings.contentSecurityPolicy) {
    return;
  }

  var headerValue = settings.contentSecurityPolicyHeader || defaultHeaderValue;

  res.set('Content-Security-Policy', headerValue);
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
    stats: {
      colors: true,
    }
  };

  var compiler = webpack(config);

  var server = new WebpackDev(compiler, options);
  var proxy = httpProxy.createServer({
    secure: false,
    changeOrigin: true,
    target: settings.proxy.target
  });

  proxy.on('proxyRes', function (proxyRes, req, res) {
    if (proxyRes.headers['set-cookie']) {
      proxyRes.headers['set-cookie'][0] = proxyRes.headers["set-cookie"][0].replace('Secure', '');
    }
  });

  proxy.on('error', function (e) {
    // don't explode on cancelled requests
  });

  server.app.all('*', function (req, res, next) {
    setCSP(res);
    proxy.web(req, res);
  });

  server.listen(options.port, '0.0.0.0', function (err) {
    if (err) {
      console.log(err);
      return;
    }
    console.log('listening on', options.host, options.port);
    console.log('Starting first compile. This will take about 10 seconds...');
  });
};


devSetup(runWebpackServer);
