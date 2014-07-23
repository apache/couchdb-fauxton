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

define([
       "app",

       "api",
       // Libs
       "addons/fauxton/resizeColumns",

       // Plugins
       "plugins/prettify",
       // this should never be global available:
       // https://github.com/zeroclipboard/zeroclipboard/blob/master/docs/security.md
       "plugins/zeroclipboard/ZeroClipboard"
],

function(app, FauxtonAPI, resizeColumns,  prettify, ZeroClipboard) {

  var Views = {};

  Views.Changes = FauxtonAPI.View.extend({
    template: "addons/documents/templates/changes",

    initialize: function () {
      this.listenTo( this.model.changes, 'sync', this.render);
      this.listenTo( this.model.changes, 'cachesync', this.render);
    },

    events: {
      "click button.js-toggle-json": "toggleJson"
    },

    toggleJson: function(event) {
      event.preventDefault();

      var $button = this.$(event.target),
          $container = $button.closest('.change-box').find(".js-json-container");

      if (!$container.is(":visible")) {
        $button
          .text("Close JSON")
          .addClass("btn-secondary")
          .removeClass("btn-primary");
      } else {
        $button.text("View JSON")
          .addClass("btn-primary")
          .removeClass("btn-secondary");
      }

      $container.slideToggle();
    },

    establish: function() {
      return [ this.model.changes.fetchOnce({prefill: true})];
    },

    serialize: function () {
      return {
        changes: this.model.changes.toJSON(),
        database: this.model
      };
    },

    afterRender: function(){
      prettyPrint();
      ZeroClipboard.config({ moviePath: "/assets/js/plugins/zeroclipboard/ZeroClipboard.swf" });
      var client = new ZeroClipboard(this.$(".js-copy"));
    }
  });



  return Views;
});
