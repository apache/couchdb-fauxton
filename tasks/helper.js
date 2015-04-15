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

var fs = require('fs'),
    path = require('path');

exports.devServerPort = 8000;
exports.couch = 'http://localhost:5984/';

exports.init = function (grunt) {
  var _ = grunt.util._,
      platform = process.platform;

  return {
    readSettingsFile: function () {
      if (fs.existsSync("settings.json")) {
        return grunt.file.readJSON("settings.json");
      } else if (fs.existsSync("settings.json.default")) {
        return grunt.file.readJSON("settings.json.default");
      } else {
        return {deps: []};
      }
    },

    readI18nFile: function () {
      if (fs.existsSync('i18n.json')) {
        return grunt.file.readJSON('i18n.json');
      }
      if (fs.existsSync('i18n.json.default')) {
        return grunt.file.readJSON('i18n.json.default');
      }

      throw new Error('i18n file missing');
    },

    processAddons: function (callback) {
      this.readSettingsFile().deps.forEach(callback);
    },

    watchFiles: function (fileExtensions, defaults) {
      return _.reduce(this.readSettingsFile().deps, function (files, dep) {
        if (dep.path) {
          _.each(fileExtensions, function (fileExtension) {
            files.push(path.join(dep.path, '**/*' + fileExtension ));
          });
        }
        return files
      }, defaults);
    },

    check_selenium: {
      command: 'test -s ./test/nightwatch_tests/selenium/selenium-server-standalone-2.45.0.jar || ' +
        'curl -o ./test/nightwatch_tests/selenium/selenium-server-standalone-2.45.0.jar ' +
        'http://selenium-release.storage.googleapis.com/2.45/selenium-server-standalone-2.45.0.jar'
    }
  };
};
