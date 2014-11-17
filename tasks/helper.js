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

exports.init = function(grunt) {
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

    getSourceDirectoriesForNightwatch : function () {
      var directories = [
          '**/nightwatch',
          '!node_modules/nightwatch',
          '!test/nightwatch_tests/reports/nightwatch'
        ],
        dir = [],
        nightwatchDirectories =  grunt.file.expand({filter: 'isDirectory'}, directories),
        projectFile = "./test/nightwatch_tests/nightwatch.json",
        project = grunt.file.readJSON(projectFile); //get file as json object

      if (!grunt.file.exists(projectFile)) {
          grunt.log.error("file " + projectFile + " not found");
          return true; //return false to abort the execution
      }

      project.src_folders = nightwatchDirectories;
      grunt.file.write(projectFile, JSON.stringify(project, null, 2)+grunt.util.linefeed); //serialize it back to file
    },

    check_selenium: {
      command: 'test -s ./test/nightwatch_tests/selenium/selenium-server-standalone-2.43.1.jar || curl -o ./test/nightwatch_tests/selenium/selenium-server-standalone-2.43.1.jar  http://selenium-release.storage.googleapis.com/2.43/selenium-server-standalone-2.43.1.jar'
    },

    check_chrome_driver: {
      command: function () {

        var type;

        switch (platform) {
          case 'darwin':
            type = 'mac32';
            break;

          case 'win32':
            type = 'win32';
            break;

          case 'linux': 
            var os = require('os');
            if (os.arch() === 'x64') {
              type = 'linux64';
            }else{
              type = 'linux32';
            }
            break;

          default:
            type = 'linux64';
        }

        return 'test -s ./test/nightwatch_tests/selenium/chromedriver || (curl -o ./test/nightwatch_tests/selenium/chromedriver_'+type+'.zip http://chromedriver.storage.googleapis.com/2.9/chromedriver_'+type+'.zip && open ./test/nightwatch_tests/selenium/chromedriver_'+type+'.zip)';
      }
    }
  };
};
