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

module.exports = function(grunt) {
  var helper = require('./tasks/helper').init(grunt),
  _ = grunt.util._,
  fs = require('fs');

  var couch_config = function () {

    var default_couch_config = {
      fauxton: {
        db: 'http://localhost:5984/fauxton',
        app: './couchapp.js',
        options: {
          okay_if_missing: true
        }
      }
    };

    var settings_couch_config = helper.readSettingsFile().couch_config;
    return settings_couch_config || default_couch_config;
  }();

  var cleanableAddons =  function () {
    var theListToClean = [];
    helper.processAddons(function(addon){
      // Only clean addons that are included from a local dir
      if (addon.path){
        theListToClean.push("app/addons/" + addon.name);
      }
    });

    return theListToClean;
  }();

  var cleanable = function(){
    // Whitelist files and directories to be cleaned
    // You'll always want to clean these two directories
    // Now find the external addons you have and add them for cleaning up
    return _.union(["dist/", "app/load_addons.js"], cleanableAddons);
  }();

  var assets = function(){
    // Base assets
    var theAssets = {
      less:{
        paths: ["assets/less"],
        files: {
          "dist/debug/css/fauxton.css": "assets/less/fauxton.less"
        }
      },
      fonts: ["assets/fonts/*.eot", "assets/fonts/*.svg", "assets/fonts/*.ttf", "assets/fonts/*.woff",],
      img: ["assets/img/**"],
      // used in concat:index_css to keep file ordering intact
      // fauxton.css should load first
      css: ["assets/css/*.css", "dist/debug/css/fauxton.css"]
    };
    helper.processAddons(function(addon){
      // Less files from addons
      var root = addon.path || "app/addons/" + addon.name;
      var lessPath = root + "/assets/less";
      if(fs.existsSync(lessPath)){
        // .less files exist for this addon
        theAssets.less.paths.push(lessPath);
        theAssets.less.files["dist/debug/css/" + addon.name + ".css"] =
          lessPath + "/" + addon.name + ".less";
        theAssets.css.push("dist/debug/css/" + addon.name + ".css");
      }
      // Images
      root = addon.path || "app/addons/" + addon.name;
      var imgPath = root + "/assets/img";
      if(fs.existsSync(imgPath)){
        theAssets.img.push(imgPath + "/**");
      }
      var fontsPath = root + "/assets/fonts";
      if(fs.existsSync(fontsPath)){
        theAssets.fonts.push(fontsPath + "/**");
      }
    });
    return theAssets;
  }();

  var templateSettings = function(){
    var defaultSettings = {
     "development": {
        "src": "assets/index.underscore",
        "dest": "dist/debug/index.html",
        "variables": {
          "requirejs": "/assets/js/libs/require.js",
          "css": "./css/index.css",
          "base": null
        }
      },
      "release": {
        "src": "assets/index.underscore",
        "dest": "dist/debug/index.html",
        "variables": {
          "requirejs": "./js/{REQUIREJS_FILE}",
          "css": "./css/{CSS_FILE}",
          "base": null
        }
      }
    };

    var settings = helper.readSettingsFile();
    return settings.template || defaultSettings;
  }();

  var couchserver_config  = function () {
    // add a "couchserver" key to settings.json with JSON that matches the
    // keys and values below (plus your customizations) to have Fauxton work
    // against a remote CouchDB-compatible server.
    var defaults = {
      dist: './dist/debug/',
      port: 8000,
      proxy: {
        target: "http://localhost:5984/"
      }
    };

    return helper.readSettingsFile().couchserver || defaults;
  }();

  var config = {

    // The clean task ensures all files are removed from the dist/ directory so
    // that no files linger from previous builds.
    clean: {
      release:  cleanable,
      watch: cleanableAddons
    },

    less: {
      compile: {
        options: {
          paths: assets.less.paths
        },
        files: assets.less.files
      }
    },

    // The jshint option for scripturl is set to lax, because the anchor
    // override inside main.js needs to test for them so as to not accidentally
    // route. Settings expr true so we can do `mightBeNullObject && mightBeNullObject.coolFunction()`
    jshint: {
      all: ['app/**/*.js', 'Gruntfile.js', "!app/**/assets/js/*.js", "!app/**/*.jsx"],
      options: {
        scripturl: true,
        evil: true,
        expr: true,
        undef: true,
        globals: {
          document: true,
          window: true,
          location: true,
          alert: true,
          console: true,
          clearInterval: true,
          setInterval: true,
          setTimeout: true,
          prompt: true,
          confirm: true,

          jQuery: true,
          Backbone: true,
          $: true,
          _: true,
          require: true,
          module: true,
          sinon: true,
          it: true,
          describe: true,
          beforeEach: true,
          afterEach: true,
          before: true,
          after: true,
          define: true,

          Spinner: true,
          prettyPrint: true

        }
      }
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
          processContent: function(src) {
            return src.replace(/<!--[\s\S]*?-->/gm, '');
          }
        },
        files: {
          "dist/debug/templates.js": [
            "app/templates/**/*.html",
            "app/addons/**/templates/**/*.html"
          ]
        }
      }
    },

    template: templateSettings,

    // The concatenate task is used here to merge the almond require/define
    // shim and the templates into the application code.  It's named
    // dist/debug/require.js, because we want to only load one script file in
    // index.html.
    concat: {
      requirejs: {
        src: [ "assets/js/libs/require.js", "dist/debug/templates.js", "dist/debug/require.js"],
        dest: "dist/debug/js/require.js"
      },

      index_css: {
        src: assets.css,
        dest: 'dist/debug/css/index.css'
      },

      test_config_js: {
        src: ["dist/debug/templates.js", "test/test.config.js"],
        dest: 'test/test.config.js'
      }
    },

    cssmin: {
      compress: {
        files: {
          "dist/release/css/index.css": [
            'dist/debug/css/index.css',
            'assets/css/*.css',
            "app/addons/**/assets/css/*.css"
          ]
        },
        options: {
          report: 'min'
        }
      }
    },

    uglify: {
      release: {
        files: {
          "dist/release/js/require.js": [
            "dist/debug/js/require.js"
          ]
        }
      }
    },

    // Runs a proxy server for easier development, no need to keep deploying to couchdb
    couchserver: couchserver_config,

    watch: {
      js: {
        files: helper.watchFiles(['.js'], ["./app/**/*.js", '!./app/load_addons.js',"./assets/**/*.js", "./test/**/*.js"]),
        tasks: ['watchRun'],
      },
      jsx: {
        files: helper.watchFiles(['.jsx'], ["./app/**/*.jsx", '!./app/load_addons.jsx',"./assets/**/*.jsx", "./test/**/*.jsx"]),
        tasks: ['watchRun'],
      },
      style: {
        files: helper.watchFiles(['.less','.css'],["./app/**/*.css","./app/**/*.less","./assets/**/*.css", "./assets/**/*.less"]),
        tasks: ['clean:watch', 'dependencies','less', 'concat:index_css'],
      },
      html: {
        // the index.html is added in as a dummy file incase there is no
        // html dependancies this will break. So we need one include pattern
        files: helper.watchFiles(['.html'], ['./index.html']),
        tasks: ['clean:watch', 'dependencies']
      },
      options: {
        nospawn: true,
        debounceDelay: 500
      }
    },

    requirejs: {
      compile: {
        options: {
          baseUrl: 'app',
          // Include the main configuration file.
          mainConfigFile: "app/config.js",

          // Output file.
          out: "dist/debug/require.js",

          // Root application module.
          name: "config",

          // Do not wrap everything in an IIFE.
          wrap: false,
          optimize: "none",
          findNestedDependencies: true
        }
      }
    },

    // Copy build artifacts and library code into the distribution
    // see - http://gruntjs.com/configuring-tasks#building-the-files-object-dynamically
    copy: {
      couchdb: {
        files: [
          // this gets built in the template task
          {src: "dist/release/index.html", dest: "../../share/www/index.html"},
          {src: ["**"], dest: "../../share/www/js/", cwd:'dist/release/js/',  expand: true},
          {src: ["**"], dest: "../../share/www/img/", cwd:'dist/release/img/', expand: true},
          {src: ["**"], dest: "../../share/www/fonts/", cwd:'dist/release/fonts/', expand: true},
          {src: ["**"], dest: "../../share/www/css/", cwd:"dist/release/css/", expand: true}
        ]
      },
      couchdebug: {
        files: [
          // this gets built in the template task
          {src: "dist/debug/index.html", dest: "../../share/www/index.html"},
          {src: ["**"], dest: "../../share/www/js/", cwd:"dist/debug/js/",  expand: true},
          {src: ["**"], dest: "../../share/www/img/", cwd:"dist/debug/img/", expand: true},
          {src: ["**"], dest: "../../share/www/fonts/", cwd:"dist/debug/fonts/", expand: true},
          {src: ["**"], dest: "../../share/www/css/", cwd:"dist/debug/css/", expand: true}
        ]
      },
      ace: {
        files: [
          {src: "assets/js/libs/ace/worker-json.js", dest: "dist/release/js/ace/worker-json.js"},
          {src: "assets/js/libs/ace/mode-json.js", dest: "dist/release/js/ace/mode-json.js"},
          {src: "assets/js/libs/ace/theme-crimson_editor.js", dest: "dist/release/js/ace/theme-crimson_editor.js"},
          {src: "assets/js/libs/ace/theme-idle_fingers.js", dest: "dist/release/js/ace/theme-idle_fingers.js"},
          {src: "assets/js/libs/ace/mode-javascript.js", dest: "dist/release/js/ace/mode-javascript.js"},
          {src: "assets/js/libs/ace/worker-javascript.js", dest: "dist/release/js/ace/worker-javascript.js"},
        ]
      },

      zeroclip: {
        files: [
          {src: "assets/js/plugins/zeroclipboard/ZeroClipboard.swf", dest: "dist/release/js/zeroclipboard/ZeroClipboard.swf"},
        ]
      },

      dist:{
        files:[
          {src: "dist/debug/index.html", dest: "dist/release/index.html"},
          {src: assets.img, dest: "dist/release/img/", flatten: true, expand: true},
          {src: assets.fonts, dest: "dist/release/fonts/", flatten: true, expand: true}
        ]
      },
      debug:{
        files:[
          {src: assets.fonts, dest: "dist/debug/fonts/", flatten: true, expand: true},
          {src: assets.img, dest: "dist/debug/img/", flatten: true, expand: true}
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

    mkcouchdb: couch_config,
    rmcouchdb: couch_config,
    couchapp: couch_config,

    mochaSetup: {
      default: {
        files: { src: helper.watchFiles(['[Ss]pec.js'], ['./app/addons/**/*[Ss]pec.js', './app/addons/**/*[Ss]pec.react.js'])},
        template: 'test/test.config.underscore',
        config: './app/config.js'
      }
    },

    mocha_phantomjs: {
      all: ['test/runner.html']
    },

    shell: {
        'build-jsx': {
            command: [
              './node_modules/react-tools/bin/jsx -x jsx app/addons/ app/addons/',
                'rm -rf <%= src_path %>/js/app/views/.module-cache/'
            ].join(' && '),
            stdout: true,
            failOnError: true
        }
    },

    exec: {
      check_selenium: helper.check_selenium,
      start_nightWatch: {
        command: __dirname + '/node_modules/nightwatch/bin/nightwatch' +
        ' -c ' + __dirname + '/test/nightwatch_tests/nightwatch.json'
      }
    },

    // generates the nightwatch.json file with appropriate content for this env
    initNightwatch: {
      default: {
        settings: helper.readSettingsFile(),
        template: 'test/nightwatch_tests/nightwatch.json.underscore',
        dest: 'test/nightwatch_tests/nightwatch.json'
      }
    },

    // these rename the already-bundled, minified requireJS and CSS files to include their hash
    md5: {
      requireJS: {
        files: { "dist/release/js/" : "dist/release/js/require.js" },
        options: {
          afterEach: function (fileChanges) {
            // replace the REQUIREJS_FILE placeholder with the actual filename
            var newFilename = fileChanges.newPath.match(/[^\/]+$/)[0];
            config.template.release.variables.requirejs = config.template.release.variables.requirejs.replace(/REQUIREJS_FILE/, newFilename);

            // remove the original requireJS file, we don't need it anymore
            fs.unlinkSync(fileChanges.oldPath);
          }
        }
      },

      css: {
        files: { "dist/release/css/": 'dist/release/css/index.css' },
        options: {
          afterEach: function (fileChanges) {
            // replace the CSS_FILE placeholder with the actual filename
            var newFilename = fileChanges.newPath.match(/[^\/]+$/)[0];
            config.template.release.variables.css = config.template.release.variables.css.replace(/CSS_FILE/, newFilename);

            // remove the original CSS file
            fs.unlinkSync(fileChanges.oldPath);
          }
        }
      }
    }
  };

  grunt.initConfig(config);

  // on watch events configure jshint:all to only run on changed file
  grunt.event.on('watch', function(action, filepath) {
    if (!!filepath.match(/.js$/) && filepath.indexOf('test.config.js') === -1) {
      grunt.config(['jshint', 'all'], filepath);
    }

    if (!!filepath.match(/.jsx$/)) {
      grunt.task.run(['jsx']);
    }

    if (!!filepath.match(/[Ss]pec.js$/)) {
      //grunt.task.run(['mochaSetup','jst', 'concat:test_config_js', 'mocha_phantomjs']);
    }
  });


  /*
   * Load Grunt plugins
   */
  // Load fauxton specific tasks
  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-couchapp');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
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
  // clean out previous build artifacts and lint
  grunt.registerTask('lint', ['clean', 'jshint']);
  grunt.registerTask('test', ['jsx', 'lint', 'dependencies', 'gen_initialize:development', 'test_inline']);
  // lighter weight test task for use inside dev/watch
  grunt.registerTask('test_inline', ['mochaSetup','jst', 'concat:test_config_js','mocha_phantomjs']);
  // Fetch dependencies (from git or local dir), lint them and make load_addons
  grunt.registerTask('dependencies', ['get_deps', 'gen_load_addons:default']);

  // minify code and css, ready for release.
  grunt.registerTask('minify', ['uglify', 'cssmin:compress']);
  grunt.registerTask('jsx', ['shell:build-jsx']);
  grunt.registerTask('build', ['less', 'concat:index_css', 'jst', 'requirejs', 'concat:requirejs', 'uglify',
    'cssmin:compress', 'md5:requireJS', 'md5:css', 'template:release']);

  /*
   * Build the app in either dev, debug, or release mode
   */
  // dev server
  grunt.registerTask('dev', ['debugDev', 'couchserver']);

  // build a debug release
  grunt.registerTask('debug', ['lint', 'dependencies', "gen_initialize:development", 'jsx', 'concat:requirejs','less', 'concat:index_css', 'template:development', 'copy:debug']);
  grunt.registerTask('debugDev', ['clean', 'dependencies', "gen_initialize:development",'jsx', 'jshint','less', 'concat:index_css', 'template:development', 'copy:debug']);

  grunt.registerTask('watchRun', ['clean:watch', 'dependencies', 'jshint']);

  // build a release
  grunt.registerTask('release', ['clean' ,'dependencies', "gen_initialize:release", 'jshint', 'build', 'copy:dist', 'copy:ace', 'copy:zeroclip']);
  grunt.registerTask('couchapp_release', ['clean' ,'dependencies', "gen_initialize:couchapp", 'jshint', 'build', 'copy:dist', 'copy:ace', 'copy:zeroclip']);

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
  grunt.registerTask('nightwatch', [ 'exec:check_selenium', 'initNightwatch', 'exec:start_nightWatch']);
};
