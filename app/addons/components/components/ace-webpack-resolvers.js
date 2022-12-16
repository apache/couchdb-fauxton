import ace from 'ace-builds';

// The entries below must match the ACE editor modes, themes and extensions used by Fauxton.

// Enables dynamically loading modes, which is required for syntax checking.
// The method below was based on node_modules/ace-builds/webpack-resolver.js but with the following changes:
// - trimmed down to import only the necessary modes, themes and extensions
// - sets "outputPath=dashboard.assets" which is required to match how Fauxton loads CSS / JS assets
ace.config.setModuleUrl('ace/theme/idle_fingers', require('file-loader?esModule=false&outputPath=dashboard.assets/js!ace-builds/src-noconflict/theme-idle_fingers.js'));
ace.config.setModuleUrl('ace/theme/dawn', require('file-loader?esModule=false&outputPath=dashboard.assets/js!ace-builds/src-noconflict/theme-dawn.js'));
ace.config.setModuleUrl('ace/mode/json', require('file-loader?esModule=false&outputPath=dashboard.assets/js!ace-builds/src-noconflict/mode-json.js'));
ace.config.setModuleUrl('ace/mode/json_worker', require('file-loader?esModule=false&outputPath=dashboard.assets/js!ace-builds/src-noconflict/worker-json.js'));
ace.config.setModuleUrl('ace/mode/javascript', require('file-loader?esModule=false&outputPath=dashboard.assets/js!ace-builds/src-noconflict/mode-javascript.js'));
ace.config.setModuleUrl('ace/mode/javascript_worker', require('file-loader?esModule=false&outputPath=dashboard.assets/js!ace-builds/src-noconflict/worker-javascript.js'));
ace.config.setModuleUrl('ace/ext/static_highlight', require('file-loader?esModule=false&outputPath=dashboard.assets/js!ace-builds/src-noconflict/ext-static_highlight.js'));
ace.config.setModuleUrl('ace/ext/searchbox', require('file-loader?esModule=false&outputPath=dashboard.assets/js!ace-builds/src-noconflict/ext-searchbox.js'));
