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
       "addons/fauxton/components",

       // Plugins
       "plugins/prettify"
],

function(app, FauxtonAPI, resizeColumns, Components, prettify, ZeroClipboard) {

  var Views = {};

  Views.ChangesHeader = FauxtonAPI.View.extend({
    template: "addons/documents/templates/changes_header",

    events: {
      'click .js-toggle-filter': "toggleQuery"
    },

    toggleQuery: function (event) {
      $('#dashboard-content').scrollTop(0);
      this.$('#query').toggle('slow');
    },

    initialize: function () {
      this.setView(".js-filter", this.filterView);
    }
  });

  Views.Changes = Components.FilteredView.extend({
    template: "addons/documents/templates/changes",

    initialize: function () {
      this.listenTo(this.model.changes, 'sync', this.render);
      this.listenTo(this.model.changes, 'cachesync', this.render);
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
      var json = this.model.changes.toJSON(),
          filteredData = this.createFilteredData(json);

      return {
        changes: filteredData,
        database: this.model
      };
    },

    createFilteredData: function (json) {
      var that = this;

      return _.reduce(this.filters, function (elements, filter) {

        return _.filter(elements, function (element) {
          var match = false;

          // make deleted searchable
          if (!element.deleted) {
            element.deleted = false;
          }
          _.each(element, function (value) {
            if (new RegExp(filter, 'i').test(value.toString())) {
              match = true;
            }
          });
          return match;
        });


      }, json, this);
    },

    afterRender: function(){
      prettyPrint();
      var client = new Components.Clipboard({
        $el: this.$('.js-copy')
      });
    }
  });



  return Views;
});
