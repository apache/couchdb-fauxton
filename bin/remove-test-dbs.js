#!/usr/bin/env node

const fs = require('fs');

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
  const out = body.forEach(db => {
    if (!/fauxton-selenium-tests/.test(db)) {
      return;
    }

    console.log('removing', db);
    nano.db.destroy(db, (err, resp) => {
      if (err) {
        console.log('ERR deleting ', db, err);
        return;
      }
    });
  });

});
