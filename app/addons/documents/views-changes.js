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
       "addons/fauxton/components",
  'addons/documents/changes/components.react',
  'addons/documents/changes/actions'
],

function(app, FauxtonAPI, Components, Changes, ChangesActions) {

  var Views = {};


  // wrappers for React components. The wrapper allows us to tie the React component into the Fauxton
  // page load lifecycle
  Views.ChangesHeaderReactWrapper = FauxtonAPI.View.extend({
    afterRender: function () {
      Changes.renderHeader(this.el);
    },
    cleanup: function () {
      Changes.remove(this.el);
    }
  });


  Views.ChangesReactWrapper = FauxtonAPI.View.extend({
    initialize: function () {
      this.filters = [];
    },

    afterRender: function () {
      ChangesActions.setChanges({
        changes: this.model.changes,
        filters: this.filters,
        databaseName: this.model.id
      });
      Changes.renderChanges(this.el);
    },

    establish: function() {
      return [this.model.changes.fetchOnce({ prefill: true })];
    },

    cleanup: function () {
      Changes.remove(this.el);
    }
  });


  return Views;
});
