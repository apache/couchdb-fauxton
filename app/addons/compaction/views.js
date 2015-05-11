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
       // Modules
       "addons/compaction/resources"
],
function (app, FauxtonAPI, Compaction) {

  // This is no longer used. We need to come up with a solution to allow to compact a specific view with CouchDB 2.0
  // Once that is supported we can convert this to React.

  /*Compaction.CompactView = FauxtonAPI.View.extend({
    template: 'addons/compaction/templates/compact_view',
    className: 'btn btn-info pull-right',
    tagName: 'button',

    initialize: function () {
      _.bindAll(this);
    },

    events: {
      "click": "compact"
    },

    disableButton: function () {
      this.$el.attr('disabled', 'disabled').text('Compacting...');
    },

    enableButton: function () {
      this.$el.removeAttr('disabled').text('Compact View');
    },


    update: function (database, designDoc, viewName) {
      this.database = database;
      this.designDoc = designDoc;
      this.viewName = viewName;
    },

    compact: function (event) {
      event.preventDefault();
      var enableButton = this.enableButton;

      this.disableButton();

      Compaction.compactView(this.database, this.designDoc).then(function () {
        FauxtonAPI.addNotification({
          type: 'success',
          msg: 'View compaction has started. Visit <a href="#activetasks">Active Tasks</a> to view progress.',
          escape: false // beware of possible XSS when the message changes
        });
      }, function (xhr, error, reason) {
        FauxtonAPI.addNotification({
          type: 'error',
          msg: 'Error: ' + JSON.parse(xhr.responseText).reason
        });
      }).always(function () {
        enableButton();
      });

    }

  });*/

  return Compaction;
});
