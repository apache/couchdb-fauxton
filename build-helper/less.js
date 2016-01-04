'use strict';

const root = __dirname + '/../';
const target = root + process.argv[2];

const fs = require('fs');
const async = require('async');
const less = require('less');

let settings;
if (fs.existsSync(root + 'settings.json')) {
  settings = require(root + 'settings.json');
} else if (fs.existsSync(root + 'settings.json.default.json')) {
  settings = require(root + 'settings.json.default.json');
} else {
  throw new Error('no settings.json or settings.json.default found');
}

const srcAndTarget = settings.deps.map(addonName => {
  addonName = addonName.name;

  return 'app/addons/' + addonName + '/assets/less/' + addonName + '.less';
});

const paths = settings.deps.map(addonName => {
  addonName = addonName.name;
  return 'app/addons/' + addonName + '/assets/less/';
});

srcAndTarget.unshift('assets/less/fauxton.less');
paths.unshift('assets/less');

// --- end setup ---

const options = {
  paths: paths
};

const parser = new less.Parser(options);


function writeCSS (files) {
  function concatCSS (src, cb) {
    fs.readFile(root + src, 'utf8', (err, data) => {
      if (err) {
        return cb(null, []);
      }

      parser.parse(data, (err, tree) => {
        if (err) {
          throw err;
        }
        return cb(null, [tree.toCSS()]);
      });
    });
  };

  async.concatSeries(files, concatCSS, (err, data) => {
    fs.writeFile(target, data.join('\n'), (err) => {
      if (err) {
        throw err;
      }

      process.exit(0);
    });
  });
}

writeCSS(srcAndTarget);
