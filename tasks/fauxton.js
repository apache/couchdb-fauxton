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

module.exports = function(grunt) {
  var _ = grunt.util._,
      fs = require('fs');

  grunt.registerMultiTask('template', 'generates an html file from a specified template', function(){
    var data = this.data,
        _ = grunt.util._,
        tmpl = _.template(grunt.file.read(data.src), null, data.variables);

    grunt.file.write(data.dest, tmpl(data.variables));
  });

  grunt.registerMultiTask('get_deps', 'Fetch external dependencies', function(version) {
    grunt.log.writeln("Fetching external dependencies");

    var done = this.async(),
        data = this.data,
        target = data.target || "app/addons/",
        settingsFile = fs.existsSync(data.src) ? data.src : "settings.json.default",
        settings = grunt.file.readJSON(settingsFile),
        _ = grunt.util._;

    // This should probably be a helper, though they seem to have been removed
    var fetch = function(deps, command){
      var child_process = require('child_process');
      var async = require('async');
      async.forEach(deps, function(dep, cb) {
        var path = target + dep.name;
        var location = dep.url || dep.path;
        grunt.log.writeln("Fetching: " + dep.name + " (" + location + ")");

        child_process.exec(command(dep, path), function(error, stdout, stderr) {
          grunt.log.writeln(stderr);
          grunt.log.writeln(stdout);
          cb(error);
        });
      }, function(error) {
        if (error) {
          grunt.log.writeln("ERROR: " + error.message);
          return false;
        } else {
          return true;
        }
      });
    };

    var remoteDeps = _.filter(settings.deps, function(dep) { return !! dep.url; });
    grunt.log.writeln(remoteDeps.length + " remote dependencies");
    var remote = fetch(remoteDeps, function(dep, destination){
      return "git clone " + dep.url + " " + destination;
    });

    var localDeps = _.filter(settings.deps, function(dep) { return !! dep.path; });
    grunt.log.writeln(localDeps.length + " local dependencies");
    var local = fetch(localDeps, function(dep, destination){
      // TODO: Windows
      var command = "cp -r " + dep.path + " " + destination;
      grunt.log.writeln(command);
      return command;
    });

    done(remote && local);

  });

  grunt.registerMultiTask('gen_load_addons', 'Generate the load_addons.js file', function() {
    var data = this.data,
        _ = grunt.util._,
        settingsFile = fs.existsSync(data.src) ? data.src : "settings.json.default",
        settings = grunt.file.readJSON(settingsFile),
        template = "app/load_addons.js.underscore",
        dest = "app/load_addons.js",
        deps = _.map(settings.deps, function(dep) {
          return "addons/" + dep.name + "/base";
        });

    var tmpl = _.template(grunt.file.read(template));
    grunt.file.write(dest, tmpl({deps: deps}));
  });

  grunt.registerMultiTask('gen_initialize', 'Generate the app.js file', function() {
    var _ = grunt.util._,
        settings = this.data,
        template = "app/initialize.js.underscore",
        dest = "app/initialize.js"
        tmpl = _.template(grunt.file.read(template)),
        app = {};
      

    _.defaults(app, settings.app, {
      root: '/',
      host: '../..',
      version: "0.0"
    });

    grunt.file.write(dest, tmpl(app));
  });

  grunt.registerMultiTask('mochaSetup','Generate a config.js and runner.html for tests', function(){
    var data = this.data,
        configInfo,
        _ = grunt.util._,
        configTemplateSrc = data.template,
        testFiles = grunt.file.expand(data.files.src);

    var configTemplate = _.template(grunt.file.read(configTemplateSrc));
    // a bit of a nasty hack to read our current config.js and get the info so we can change it 
    // for our testing setup
    var require = {
      config: function (args) {
        configInfo = args;
        configInfo.paths['chai'] = "../test/mocha/chai";
        configInfo.paths['sinon-chai'] = "../test/mocha/sinon-chai";
        configInfo.paths['testUtils'] = "../test/mocha/testUtils";
        configInfo.baseUrl = '../app';
        delete configInfo.deps;
      }
    };

    eval(grunt.file.read(data.config) +'');

    grunt.file.write('./test/test.config.js', configTemplate({configInfo: configInfo, testFiles: testFiles}));
  });


  // run every time nightwatch is executed from the command line
  grunt.registerMultiTask('initNightwatch', 'Sets up Nightwatch', function () {

    // perform a little validation on the settings
    _validateNightwatchSettings(this.data.settings);

    // figure out what tests we need to run by examining the settings.json file content
    var addonsWithTests = _getNightwatchTests(this.data.settings);

    // if the user passed a --file="X" on the command line, find the matched file
    var singleTestToRun = grunt.option('file');
    if (singleTestToRun) {
      addonsWithTests = _findSpecificNightwatchTest(addonsWithTests, singleTestToRun);
    }

    // now generate the new nightwatch.json file
    var nightwatchTemplate = _.template(grunt.file.read(this.data.template));

    // pick a random test account to use
    var account = _getTestAccount(this.data.settings.nightwatch.accounts);

    grunt.file.write(this.data.dest, nightwatchTemplate({
      src_folders: JSON.stringify(addonsWithTests),
      custom_commands_path: JSON.stringify(this.data.settings.nightwatch.custom_commands_path),
      globals_path: this.data.settings.nightwatch.globals_path,
      username: account.username,
      password: account.password,
      launch_url: account.launch_url,
      fauxton_host: account.fauxton_host,
      fauxton_port: account.fauxton_port,
      db_host: account.db_host,
      db_port: account.db_port
    }));
  });


  // HELPERS

  function _validateNightwatchSettings (data) {
    var error = '';

    // if the settings file didn't contain any addons, it points to bigger problems!
    if (!data.deps.length) {
      error = 'No addons listed in settings.json - no tests to run!';

    } else if (!_.has(data, 'nightwatch')) {
      error = 'Your settings.json file is missing the nightwatch section. Please check the user doc.';

    // some basic validation to confirm the accounts section appears
    } else if (!_.has(data.nightwatch, 'accounts') || data.nightwatch.accounts.length === 0) {
      error = 'Your settings.json file doesn\'t contain any test accounts.';

    } else {

      // confirm all listed test accounts have at least a username and password
      var invalidTestAccounts = _.filter(data.nightwatch.accounts, function(account) {
        return (!_.has(account, 'username') || account.username === '' ||
                !_.has(account, 'password') || account.password === '');
      });
      if (invalidTestAccounts.length) {
        error = 'Your settings.json file contains missing data from the nightwatch accounts.';
      }
    }

    if (error) {
      grunt.fail.fatal(error);
    }
  };

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
  };

  function _getNightwatchTests (settings) {
    var addonBlacklist = (_.has(settings.nightwatch, 'addonBlacklist')) ? settings.nightwatch.addonBlacklist : [];

    return _.filter(settings.deps, function(addon) {

      // if we've been told to ignore this addon's test, ignore 'em!
      if (_.contains(addonBlacklist, addon.name)) {
        return false;
      }

      var fileLocation = 'app/addons/' + addon.name + '/tests/nightwatch';
      if (_.has(addon, 'path')) {
        fileLocation = addon.path + '/tests/nightwatch';
      }

      // see if the addon has any tests
      return fs.existsSync(fileLocation);

    }).map(function(addon) {
      return 'app/addons/' + addon.name + '/tests/nightwatch';
    });
  };

  /**
   * By default, we randomly pick a test account to use from the nightwatch.accounts array in the settings file.
   * However, it may be overridden by including a `grunt nightwatch --username=X` param.
   * @param accounts
   * @private
   */
  function _getTestAccount(accounts) {
    var account;
    var username = grunt.option('username');
    if (username) {
      account = _.find(accounts, function(account) {
        return account.username == username;
      });
    } else {
      account = accounts[Math.floor(Math.random() * accounts.length)];
    }
    return account;
  }

};
