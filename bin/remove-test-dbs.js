#!/usr/bin/env node

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

const fs = require('fs');
const async = require('async');

const settingsFilePath = './settings.json';
const settingsFile = fs.existsSync(settingsFilePath) ? settingsFilePath : './settings.json.default.json';
const settings = JSON.parse(fs.readFileSync(settingsFile)).nightwatch;
const dbUrl = `${settings.db_protocol}://${settings.fauxton_username}:${settings.password}@${settings.db_host}:${settings.db_port}`;
const nano = require('nano')(dbUrl);

nano.db.list((err, body) => {
  if (err) {
    console.error('ERR', err);
    return;
  }
  const list = body.filter(db => {
    return /fauxton-selenium-tests/.test(db);
  }).map(db => {
    return (cb) => {
      console.info('Removing db', db);
      nano.db.destroy(db, (err) => {
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
