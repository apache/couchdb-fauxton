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

const path = require('path');
var webpackConfig = require("./webpack.config.dev.js");

module.exports = function (grunt) {
  var helper = require('./tasks/helper.js'),
      initHelper = helper.init(grunt),
      _ = grunt.util._,
      fs = require('fs');

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

  var couchserver_config  = function () {
    // add a "couchserver" key to settings.json with JSON that matches the
    // keys and values below (plus your customizations) to have Fauxton work
    // against a remote CouchDB-compatible server.
    var defaults = {
      port: helper.devServerPort,
      proxy: {
        target: helper.couch
      }
    };

    return initHelper.readSettingsFile().couchserver || defaults;
  }();

  var config = {

    // The clean task ensures all files are removed from the dist/ directory so
    // that no files linger from previous builds.
    clean: {
      options: {
        'force': true
      },
      release:  cleanable
    },

    // The jst task compiles all application templates into JavaScript
    // functions with the underscore.js template function from 1.2.4.  You can
    // change the namespace and the template options, by reading this:
    // https://github.com/gruntjs/grunt-contrib/blob/master/docs/jst.md
    //
    // The concat task depends on this file to exist, so if you decide to
    // remove this, ensure concat is updated accordingly.
    jst: {
      compile: {
        options: {
          processContent: function (src) {
            return src.replace(/<!--[\s\S]*?-->/gm, '');
          }
        },
        files: {
          'dist/tmp-out/templates.js': [
            "app/templates/**/*.html",
            "app/addons/**/templates/**/*.html"
          ]
        }
      }
    },

    template: templateSettings,

    concat: {
      bundle_js: {
        src: ['dist/tmp-out/templates.js', "dist/debug/bundle.js"],
        dest: "dist/debug/bundle.js"
      },

      bundlerelease_js: {
        src: ['dist/tmp-out/templates.js', "dist/release/bundle.js"],
        dest: "dist/tmp-out/bundle.js"
      }
    },

    // Copy build artifacts and library code into the distribution
    // see - http://gruntjs.com/configuring-tasks#building-the-files-object-dynamically
    copy: {
      couchdb: {
        files: [
          // this gets built in the template task
          {src: "dist/release/index.html", dest: "../../share/www/index.html"},
          {src: ["**"], dest: "../../share/www/dashboard.assets/js/", cwd: 'dist/release/dashboard.assets/js/',  expand: true},
          {src: ["**"], dest: "../../share/www/dashboard.assets/img/", cwd: 'dist/release/dashboard.assets/img/', expand: true},
          {src: ["**"], dest: "../../share/www/dashboard.assets/fonts/", cwd: 'dist/release/dashboard.assets/fonts/', expand: true},
          {src: ["**"], dest: "../../share/www/dashboard.assets/css/", cwd: "dist/release/dashboard.assets/css/", expand: true}
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

      testTemplates: {
        files: [
          {src: 'dist/tmp-out/templates.js', dest: 'test/templates.js'}
       ]
      },
      devTemplates: {
        files: [
          {src: 'dist/tmp-out/templates.js', dest: 'dist/debug/templates.js'}
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

    mochaSetup: {
      default: {
        files: {
          src: initHelper.getFileList(['[Ss]pec.js'], [
            './app/core/**/*[Ss]pec.js',
            './app/addons/**/*[Ss]pec.js',
            './app/addons/**/*[Ss]pec.react.jsx',
            './app/addons/**/*[Ss]pec.jsx'
          ])
        },
        template: 'test/test.config.underscore'
      }
    },

    shell: {
      webpack: {
        command: 'npm run webpack:dev'
      },

      webpackrelease: {
        command: 'npm run webpack:release'
      },

      webpacktest: {
        command: 'npm run webpack:test'
      },

      phantomjs: {
        command: 'npm run phantomjs'
      }
    },

    exec: {
      check_selenium: initHelper.check_selenium,
      start_nightWatch: {
        command: __dirname + '/node_modules/nightwatch/bin/nightwatch' +
        ' -c ' + __dirname + '/test/nightwatch_tests/nightwatch.json'
      }
    },

    // generates the nightwatch.json file with appropriate content for this env
    initNightwatch: {
      default: {
        settings: initHelper.readSettingsFile(),
        template: 'test/nightwatch_tests/nightwatch.json.underscore',
        dest: 'test/nightwatch_tests/nightwatch.json'
      }
    },

    // these rename the already-bundled, minified requireJS and CSS files to include their hash
    md5: {
      bundlejs: {
        files: { 'dist/release/dashboard.assets/js/': 'dist/tmp-out/bundle.js' },
        options: {
          afterEach: function (fileChanges) {
            // replace the REQUIREJS_FILE placeholder with the actual filename
            const newFilename = path.basename(fileChanges.newPath);
            config.template.release.variables.bundlejs = config.template.release.variables.bundlejs.replace(/BUNDLEJS_FILE/, newFilename);
          }
        }
      }
    },

  };

  grunt.initConfig(config);

  /*
   * Load Grunt plugins
   */
  // Load fauxton specific tasks
  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-couchapp');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-md5');
  /*
   * Default task
   */
  // defult task - install minified app to local CouchDB
  grunt.registerTask('default', 'couchdb');

  /*
   * Transformation tasks
   */
  grunt.registerTask('test', ['checkTestExists', 'clean:release', 'dependencies', 'copy:debug', 'gen_initialize:development', 'test_inline']);

  // lighter weight test task for use inside dev/watch
  grunt.registerTask('test_inline', ['mochaSetup', 'shell:webpacktest', 'jst', 'copy:testTemplates', 'shell:phantomjs']);
  // Fetch dependencies (from git or local dir)
  grunt.registerTask('dependencies', ['get_deps', 'gen_load_addons:default']);

  // minify code and css, ready for release.
  grunt.registerTask('build', ['copy:distDepsRequire', 'jst', 'shell:webpackrelease', 'concat:bundlerelease_js',
    'md5:bundlejs', 'template:release']);
  /*
   * Build the app in either dev, debug, or release mode
   */
  // dev server
  grunt.registerTask('dev', function () {
    console.log('This is deprecated. Please run npm run dev instead');
  });

  // build a debug release
  grunt.registerTask('debug', ['clean', 'dependencies', "gen_initialize:development",
    'template:development', 'copy:debug']);

  grunt.registerTask('debugDev', ['clean', 'dependencies', "gen_initialize:development",
    'template:development', 'copy:debug', 'jst', 'shell:webpack', 'concat:bundle_js']);

  grunt.registerTask('devSetup', ['dependencies', "gen_initialize:development",
    'template:development', 'copy:debug', 'jst', 'copy:devTemplates']);
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
  grunt.registerTask('nightwatch', ['exec:check_selenium', 'initNightwatch', 'exec:start_nightWatch']);
};
