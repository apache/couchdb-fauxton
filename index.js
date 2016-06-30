var path = require("path");
var http = require("http");
var httpProxy = require('http-proxy');
var send = require('send');
var urlLib = require('url');
var _ = require('lodash');
var dist_dir = process.env.DIST || __dirname + '/dist/release/';

module.exports = function (options) {
  // Options
  var setContentSecurityPolicy = options.contentSecurityPolicy;
  var port = options.port;
  var proxyUrl = options.couchdb;

  function sendFile (req, res, filePath) {
    return send(req, filePath)
    .on('error', function (err) {
      if (err.status === 404) {
        console.log('Could not locate', filePath);
      } else {
        console.log('ERROR', filePath, err);
      }

      res.setHeader("Content-Type", "text/javascript");
      res.statusCode = 404;
      res.end(JSON.stringify({error: err.message}));
    })
    .pipe(res);
  }

  var fileTypes = ['.js', '.css', '.png', '.swf', '.eot', '.woff', '.svg', '.ttf', '.swf'];

  function isFile (url) {
    return _.contains(fileTypes, path.extname(url));
  }

  // create proxy to couch for all couch requests
  var proxy = httpProxy.createServer({
    secure: false,
    changeOrigin: true,
    target: proxyUrl
  });

  http.createServer(function (req, res) {
    var isDocLink = /_utils\/docs/.test(req.url);
    var url = req.url.split(/\?v=|\?noCache/)[0].replace('_utils', '');
    var accept = [];
    if (req.headers.accept) {
      var accept = req.headers.accept.split(',');
    }
    if (setContentSecurityPolicy) {
      var headerValue = "default-src 'self'; child-src 'self' data: blob:; img-src 'self' data:; font-src 'self'; " +
                        "script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";
      res.setHeader('Content-Security-Policy', headerValue);
    }

    if (url === '/' && accept[0] !== 'application/json') {
      // serve main index file from here
      return sendFile(req, res, path.join(dist_dir, 'index.html'));
    } else if (isFile(url) && !isDocLink) {
      return sendFile(req, res, path.join(dist_dir, url));
    }

    // This sets the Host header in the proxy so that one can use external
    // CouchDB instances and not have the Host set to 'localhost'
    var urlObj = urlLib.parse(req.url);
    req.headers.host = urlObj.host;

    proxy.web(req, res);
  }).listen(port, '0.0.0.0');

  proxy.on('error', function (e) {
    // don't explode on cancelled requests
  });

  //Remove Secure on the cookie if the proxy is communicating to a CouchDB instance
  // via https.
  proxy.on('proxyRes', function (proxyRes, req, res) {
    if (proxyRes.headers['set-cookie']) {
      proxyRes.headers['set-cookie'][0] = proxyRes.headers["set-cookie"][0].replace('Secure', '');
    }
  });

  var logo = [
    [""],
    [" ______                        _                   "],
    ["|  ____|                      | |                  "],
    ["| |__    __ _   _   _  __  __ | |_    ___    _ __  "],
    ["|  __|  / _` | | | | | \\ \\/ / | __|  / _ \\  | '_ \\ "],
    ["| |    | (_| | | |_| |  >  <  | |_  | (_) | | | | |"],
    ["|_|     \\__,_|  \\__,_| /_/\\_\\  \\__|  \\___/  |_| |_|"],
    [""]
  ];

  _.each(logo, function (line) {
    console.log(line.toString());
  });

  console.log('Listening on ' + port);
};
