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


// This is the main application configuration file.  It is a Grunt
// configuration file, which you can learn more about here:
// https://github.com/cowboy/grunt/blob/master/docs/configuring.md

/*jslint node: true */
"use strict";

module.exports = function (grunt) {
  var helper = require('./tasks/helper.js'),
      initHelper = helper.init(grunt),
      _ = grunt.util._;

  var couch_config = function () {
    var default_couch_config = {
      fauxton: {
        db: helper.couch + 'fauxton',
        app: './couchapp.js',
        options: {
          okay_if_missing: true
        }
      }
    };

    var settings_couch_config = initHelper.readSettingsFile().couch_config;
    return settings_couch_config || default_couch_config;
  }();

  var cleanableAddons =  function () {
    var theListToClean = [];
    initHelper.processAddons(function (addon) {
      // Only clean addons that are included from a local dir
      if (addon.path) {
        theListToClean.push("app/addons/" + addon.name);
      }
    });

    return theListToClean;
  }();

  var cleanable = function () {
    // Whitelist files and directories to be cleaned
    // You'll always want to clean these two directories
    // Now find the external addons you have and add them for cleaning up
    return _.union(["dist/", "app/load_addons.js"], cleanableAddons);
  }();

  var templateSettings = (function getTemplateSettings () {
    var settings = initHelper.readSettingsFile();

    var i18n = JSON.stringify(initHelper.readI18nFile(), null, ' ');

    Object.keys(settings.template).forEach(function (key) {
      settings.template[key].variables.generationDate = new Date().toISOString();
      if (!settings.template[key].variables.generationLabel) {
        settings.template[key].variables.generationLabel = 'Generated: ';
      }
      settings.template[key].app.i18n = i18n;
    });

    return settings.template;
  })();

  var config = {

    // The clean task ensures all files are removed from the dist/ directory so
    // that no files linger from previous builds.
    clean: {
      options: {
        'force': true
      },
      release:  cleanable
    },

    template: templateSettings,

    // Copy build artifacts and library code into the distribution
    // see - http://gruntjs.com/configuring-tasks#building-the-files-object-dynamically
    copy: {
      couchdb: {
        files: [
          // this gets built in the template task
          {src: "dist/release/index.html", dest: "../../share/www/index.html"},
          {src: ["**"], dest: '../../share/www/dashboard.assets/', cwd: 'dist/release/dashboard.assets/',  expand: true},
        ]
      },
      couchdebug: {
        files: [
          // this gets built in the template task
          {src: "dist/debug/index.html", dest: "../../share/www/index.html"},
        ]
      },
      dist:{
        files:[
          {src: 'dist/debug/index.html', dest: 'dist/release/index.html'},
          {src: './favicon.ico', dest: "dist/release/favicon.ico"}
        ]
      },

      distDepsRequire: {
        files:[
          {src: 'assets/**', dest: 'dist/tmp-out/', flatten: false, expand: false},
        ]
      },

      debug: {
        files:[
          {src: './favicon.ico', dest: "dist/debug/favicon.ico"}
        ]
      },

      testfiles: {
        files:[
          {src: ['test/**'], dest: 'dist/debug/', flatten: false, expand: true},
          {src: 'assets/**', dest: 'dist/debug/', flatten: false, expand: false},
        ]
      }
    },

    get_deps: {
      "default": {
        src: "settings.json"
      }
    },

    gen_load_addons: {
      "default": {
        src: "settings.json"
      }
    },
    gen_initialize: templateSettings,
    checkTestExists: templateSettings,

    mkcouchdb: couch_config,
    rmcouchdb: couch_config,
    couchapp: couch_config,

    shell: {
      webpack: {
        command: 'npm run webpack:dev'
      },

      webpackrelease: {
        command: 'npm run webpack:release'
      }
    },

    exec: {
      start_nightWatch: {
        command: 'node ' + __dirname + '/node_modules/nightwatch/bin/nightwatch' +
        ' -c ' + __dirname + '/test/nightwatch_tests/nightwatch.json',
        options: {
          maxBuffer: 1000 * 1024
        }
      },
      start_nightWatch_with_retries: {
        command: 'node ' + __dirname + '/node_modules/nightwatch/bin/nightwatch' +
        ' -c ' + __dirname + '/test/nightwatch_tests/nightwatch.json' +
        ' --suiteRetries 3',
        options: {
          maxBuffer: 1000 * 1024
        }
      }
    },

    // generates the nightwatch.json file with appropriate content for this env
    initNightwatch: {
      default: {
        settings: initHelper.readSettingsFile(),
        template: 'test/nightwatch_tests/nightwatch.json.underscore',
        dest: 'test/nightwatch_tests/nightwatch.json'
      }
    }
  };

  grunt.initConfig(config);

  /*
   * Load Grunt plugins
   */
  // Load fauxton specific tasks
  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-shell');
  /*
   * Default task
   */
  // defult task - install minified app to local CouchDB
  grunt.registerTask('default', 'couchdb');

  /*
   * Transformation tasks
   */
  grunt.registerTask('test', ['clean:release', 'dependencies', 'copy:debug', 'gen_initialize:development']);

  // Fetch dependencies (from git or local dir)
  grunt.registerTask('dependencies', ['get_deps', 'gen_load_addons:default']);

  // minify code and css, ready for release.
  grunt.registerTask('build', ['copy:distDepsRequire', 'shell:webpackrelease']);
  /*
   * Build the app in either dev, debug, or release mode
   */
  // dev server
  grunt.registerTask('dev', function () {
    console.warn('This is deprecated. Please run npm run dev instead');
  });

  // build a debug release
  grunt.registerTask('debug', ['clean', 'dependencies', "gen_initialize:development",
    'copy:debug']);

  grunt.registerTask('debugDev', ['clean', 'dependencies', "gen_initialize:development",
    'copy:debug', 'shell:webpack']);

  grunt.registerTask('devSetup', ['dependencies', "gen_initialize:development",
    'copy:debug']);
  grunt.registerTask('devSetupWithClean', ['clean', 'devSetup']);

  grunt.registerTask('watchRun', ['clean:watch', 'dependencies', 'shell:stylecheck']);

  // build a release
  grunt.registerTask('release_commons_prefix', ['clean', 'dependencies']);
  grunt.registerTask('release_commons_suffix', ['build', 'copy:dist']);

  grunt.registerTask('release', ['release_commons_prefix', 'gen_initialize:release', 'release_commons_suffix']);
  grunt.registerTask('couchapp_release', ['release_commons_prefix', 'gen_initialize:couchapp', 'release_commons_suffix']);

  /*
   * Install into CouchDB in either debug, release, or couchapp mode
   */
  // make a development install that is server by mochiweb under _utils
  grunt.registerTask('couchdebug', ['debug', 'copy:couchdebug']);
  // make a minimized install that is server by mochiweb under _utils
  grunt.registerTask('couchdb', ['release', 'copy:couchdb']);
  // make an install that can be deployed as a couchapp
  grunt.registerTask('couchapp_setup', ['couchapp_release']);
  // install fauxton as couchapp
  grunt.registerTask('couchapp_install', ['rmcouchdb:fauxton', 'mkcouchdb:fauxton', 'couchapp:fauxton']);
  // setup and install fauxton as couchapp
  grunt.registerTask('couchapp_deploy', ['couchapp_setup', 'couchapp_install']);

  /*
   * Nightwatch functional testing
   */
  //Start Nightwatch test from terminal, using: $ grunt nightwatch
  grunt.registerTask('nightwatch', ['initNightwatch', 'exec:start_nightWatch']);
  //Same as above but the Nightwatch runner will retry tests 3 times before failing
  grunt.registerTask('nightwatch_retries', ['initNightwatch', 'exec:start_nightWatch_with_retries']);
};
