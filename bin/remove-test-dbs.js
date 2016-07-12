#!/usr/bin/env node

const fs = require('fs');
const async = require('async');

const settingsFilePath = './settings.json';
const settingsFile = fs.existsSync(settingsFilePath) ? settingsFilePath : './settings.json.default.json';
const settings = JSON.parse(fs.readFileSync(settingsFile)).nightwatch;
const dbUrl = `http://${settings.fauxton_username}:${settings.password}@${settings.db_host}:${settings.db_port}`;
const nano = require('nano')(dbUrl);

nano.db.list((err, body) => {
  if (err) {
    console.log('ERR', err);
    return;
  }
  const list = body.filter(db => {
    return /fauxton-selenium-tests/.test(db);
  }).map(db => {
    return (cb) => {
      console.log('removing', db);
      nano.db.destroy(db, (err, resp) => {
        if (err) {
          cb(err);
          return;
        }

        cb();
      });
    };
  });

  async.parallel(list, (err) => {
    if (err) {
      console.error(err);
    }
  });

});
