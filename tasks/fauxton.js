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

module.exports = function (grunt) {
  var _ = grunt.util._,
      fs = require('fs');

  grunt.registerMultiTask('template', 'generates an html file from a specified template', function () {
    var data = this.data,
        _ = grunt.util._,
        tmpl = _.template(grunt.file.read(data.src), null, data.variables);

    grunt.file.write(data.dest, tmpl(data.variables));
  });

  grunt.registerMultiTask('get_deps', 'Fetch external dependencies', function (version) {

    grunt.log.writeln('Fetching external dependencies');
    var done = this.async(),
        data = this.data,
        target = data.target || 'app/addons/',
        settingsFile = fs.existsSync(data.src) ? data.src : 'settings.json.default.json',
        settings = grunt.file.readJSON(settingsFile),
        _ = grunt.util._;

    // This should probably be a helper, though they seem to have been removed
    var fetch = function (deps, command) {
      var child_process = require('child_process');
      var async = require('async');
      async.forEach(deps, function (dep, cb) {
        var path = target + dep.name;
        var location = dep.url || dep.path;
        grunt.log.writeln('Fetching: ' + dep.name + ' (' + location + ')');

        child_process.exec(command(dep, path), function (error, stdout, stderr) {
          grunt.log.writeln(stderr);
          grunt.log.writeln(stdout);
          cb(error);
        });
      }, function (error) {
        if (error) {
          grunt.log.writeln('ERROR: ' + error.message);
        }

        done();
      });
    };

    var localDeps = _.filter(settings.deps, function (dep) { return !! dep.path; });
    grunt.log.writeln(localDeps.length + ' local dependencies');
    var local = fetch(localDeps, function (dep, destination) {
      // TODO: Windows
      var command = 'cp -r ' + dep.path + '/ ' + destination + '/';
      grunt.log.writeln(command);
      return command;
    });
  });

  grunt.registerMultiTask('gen_load_addons', 'Generate the load_addons.js file', function () {
    var data = this.data,
        _ = grunt.util._,
        settingsFile = fs.existsSync(data.src) ? data.src : 'settings.json.default.json',
        settings = grunt.file.readJSON(settingsFile),
        template = 'app/load_addons.js.underscore',
        dest = 'app/load_addons.js',
        deps = _.map(settings.deps, function (dep) {
          return './addons/' + dep.name + '/base';
        });

    var tmpl = _.template(grunt.file.read(template));
    grunt.file.write(dest, tmpl({deps: deps}));
  });

  grunt.registerMultiTask('gen_initialize', 'Generate the app.js file', function () {
    var _ = grunt.util._,
        settings = this.data,
        template = 'app/initialize.js.underscore',
        dest = 'app/initialize.js',
        tmpl = _.template(grunt.file.read(template)),
        app = {};

    _.defaults(app, settings.app, {
      root: '/',
      host: '../..',
      version: "0.0"
    });

    grunt.file.write(dest, tmpl(app));
  });

  // quick sanity check to run immediately when the user specifies a specific mocha test to run, like
  //     `grunt test --file=./my/test.js`
  // This dies immediately if the file doesn't exist and notifies the user.
  grunt.registerMultiTask('checkTestExists', 'Confirms that if a specific mocha test exists', function () {
    var fileSrc = grunt.option('file');

    // the + 'x' check checks for jsx files that haven't been compiled yet
    if (fileSrc && !fs.existsSync(fileSrc) && !fs.existsSync(fileSrc + 'x')) {
      grunt.fail.fatal('Mocha test file not found: ' + fileSrc);
    }
  });

  grunt.registerMultiTask('mochaSetup', 'Generate a config.js and runner.html for tests', function () {
    var data = this.data,
        configInfo,
        _ = grunt.util._,
        configTemplateSrc = data.template;

    var fileSrc = grunt.option('file') || data.files.src;
    var testFiles =  grunt.file.expand(fileSrc);

    // filter out any tests that aren't found in the /app/ folder. For scripts that are extending Fauxton, we still
    // know that all addons will have been copied into /app. This prevent tests being ran twice
    testFiles = _.filter(testFiles, function (filePath) {
      return /\/app\//.test(filePath);
    });

    var configTemplate = _.template(grunt.file.read(configTemplateSrc));
    grunt.file.write('./test/test.config.js', configTemplate({testFiles: testFiles}));
  });


  // run every time nightwatch is executed from the command line
  grunt.registerMultiTask('initNightwatch', 'Sets up Nightwatch', function () {

    // perform a little validation on the settings
    _validateNightwatchSettings(this.data.settings);

    // figure out what tests we need to run by examining the settings.json file content. This method returns
    // the list of addon folders to test, plus a list of files to exclude
    var result = _getNightwatchTests(this.data.settings);
    var addonsWithTests = result.addonFolders;
    var excludeTests = result.excludeTests;

    // if the user passed a --file="X" on the command line, filter out
    var singleTestToRun = grunt.option('file');
    if (singleTestToRun) {
      addonsWithTests = _findSpecificNightwatchTest(addonsWithTests, singleTestToRun);
    }

    // now generate the new nightwatch.json file
    var nightwatchTemplate = _.template(grunt.file.read(this.data.template));
    grunt.file.write(this.data.dest, nightwatchTemplate({
      src_folders: JSON.stringify(addonsWithTests),
      exclude_tests: JSON.stringify(excludeTests, null, '\t'),
      custom_commands_path: JSON.stringify(this.data.settings.nightwatch.custom_commands_path),
      globals_path: this.data.settings.nightwatch.globals_path,
      fauxton_username: this.data.settings.nightwatch.fauxton_username,
      password: this.data.settings.nightwatch.password,
      launch_url: this.data.settings.nightwatch.launch_url,
      fauxton_host: this.data.settings.nightwatch.fauxton_host,
      fauxton_port: this.data.settings.nightwatch.fauxton_port,
      db_host: this.data.settings.nightwatch.db_host,
      db_port: this.data.settings.nightwatch.db_port,
      selenium_port: this.data.settings.nightwatch.selenium_port
    }));
  });


  // HELPERS

  function _validateNightwatchSettings (data) {
    var error = '';

    // if the settings file didn't contain any addons, it points to bigger problems!
    if (!data.deps.length) {
      error = 'No addons listed in settings.json - no tests to run!';

    // check the requires nightwatch settings. These should always exist in the settings.json file
    } else if (!_.has(data, 'nightwatch') ||
      !_.has(data.nightwatch, 'fauxton_username') ||
      !_.has(data.nightwatch, 'password')) {
      error = 'Your settings.json file doesn\'t contain valid nightwatch settings. Please check the user doc.';
    }

    if (error) {
      grunt.fail.fatal(error);
    }
  }

  function _findSpecificNightwatchTest (addonsWithTests, file) {
    var filename = file + '.js';

    var paths = addonsWithTests.reduce(function (acc, dir) {
      if (fs.existsSync(dir + '/' + filename)) {
        acc.push(dir + '/' + filename);
      }
      return acc;
    }, []);

    if (paths.length > 1) {
      grunt.fail.fatal('Found multiple nightwatch tests with that filename.');
    } else if (!paths.length) {
      grunt.fail.fatal('Found no testfile named ' + filename);
    }

    return paths[0];
  }

  function _getNightwatchTests (settings) {
    var testBlacklist = (_.has(settings.nightwatch, 'testBlacklist')) ? settings.nightwatch.testBlacklist : {};
    var addonFolders = [],
        excludeTests = [];

    _.each(settings.deps, function (addon) {
      var addonTestsFolder = 'app/addons/' + addon.name + '/tests/nightwatch';
      if (_.has(addon, 'path')) {
        addonTestsFolder = addon.path + '/tests/nightwatch';
      }

      // if this addon doesn't have any tests, just move along. Nothing to see here.
      if (!fs.existsSync(addonTestsFolder)) {
        return;
      }

      // next up: see if this addon has anything blacklisted
      if (_.has(testBlacklist, addon.name) && _.isArray(testBlacklist[addon.name]) && testBlacklist[addon.name].length > 0) {

        // a '*' means the user wants to blacklist all tests in the addon
        if (_.contains(testBlacklist[addon.name], '*')) {
          return;
        }

        // add the folder to test. Any specific files will be blacklisted separately
        addonFolders.push(addonTestsFolder);

        _.each(fs.readdirSync(addonTestsFolder), function (file) {
          if (_.contains(testBlacklist[addon.name], file)) {
            // the relative path is added to work around an oddity with nightwatch. It evaluates all exclude paths
            // relative to the current src_folder being examined, so we need to return to the root first
            excludeTests.push('../../../../../' + addonTestsFolder + '/' + file);
          }
        });

      } else {

        // add the whole folder
        addonFolders.push(addonTestsFolder);
      }
    });

    return {
      addonFolders: addonFolders,
      excludeTests: excludeTests
    };
  }

};
