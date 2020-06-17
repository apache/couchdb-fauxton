const spawn = require('child_process').spawn;
const fs = require("fs");
const webpack = require('webpack');
const WebpackDev = require('webpack-dev-server');
const config = require('./webpack.config.dev.js');
const httpProxy = require('http-proxy');
const path = require('path');


const loadSettings = function () {
  let fileName = './settings.json.default.json';
  if (fs.existsSync('./settings.json')) {
    fileName = './settings.json';
  }

  return require(fileName).couchserver || {
    port: process.env.FAUXTON_PORT || 8000,
    contentSecurityPolicy: true,
    proxy: {
      target: process.env.COUCH_HOST || 'http://127.0.0.1:5984',
      changeOrigin: false
    }
  };
};

const settings = loadSettings();

const devSetup = function (cb) {
  console.info('setup dev environment');
  let cmd = 'devSetupWithClean';
  if (settings.noClean) {
    cmd = 'devSetup';
  }
  const isOnWindows = process.platform === 'win32';
  const gruntCmd = isOnWindows ? 'grunt.cmd' : 'grunt';
  const grunt = spawn(gruntCmd, [cmd]);

  grunt.stdout.on('data', (data) => {
    console.info(data.toString());
  });

  grunt.stderr.on('error', (data) => {
    console.info('Setup error:', data.toString());
  });

  grunt.on('close', (code) => {
    console.info('dev setup finished with code', code);
    if (code === 0) {
      cb();
    }
  });
};

const defaultHeaderValue = "default-src 'self'; child-src 'self' blob: https://blog.couchdb.org; img-src 'self' data:; font-src 'self'; " +
                  "script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";
function getCspHeaders () {
  if (!settings.contentSecurityPolicy) {
    return;
  }

  const cspHeader = settings.contentSecurityPolicyHeader || defaultHeaderValue;

  return {
    'Content-Security-Policy': cspHeader
  };
}

const runWebpackServer = function () {
  const proxy = httpProxy.createServer({
    secure: false,
    changeOrigin: true,
    target: settings.proxy.target
  });

  proxy.on('proxyRes', function (proxyRes) {
    if (proxyRes.headers['set-cookie']) {
      proxyRes.headers['set-cookie'][0] = proxyRes.headers["set-cookie"][0].replace('Secure', '');
    }
  });

  proxy.on('error', function () {
    // don't explode on cancelled requests
  });

  const options = {
    contentBase: path.join(__dirname, '/dist/debug/'),
    host: 'localhost',
    port: process.env.FAUXTON_PORT || 8000,
    overlay: true,
    hot: false,
    historyApiFallback: false,
    disableHostCheck: true,
    stats: {
      colors: true,
    },
    headers: getCspHeaders(),
    before: (app) => {
      app.all('*', (req, res, next) => {
        const accept = req.headers.accept ? req.headers.accept.split(',') : '';

        if (/application\/json/.test(accept[0]) || /multipart\/form-data/.test(accept[0])) {
          proxy.web(req, res);
          return;
        }

        next();
      });
    }
  };

  const compiler = webpack(config);
  const server = new WebpackDev(compiler, options);

  server.listen(options.port, '0.0.0.0', function (err) {
    if (err) {
      console.error(err);
      return;
    }
    console.info('listening on', options.host, options.port);
    console.info('Starting first compile. This will take about 10 seconds...');
  });
};


devSetup(runWebpackServer);
