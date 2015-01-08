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
  "api",
  "addons/documents/components.react",
  "addons/documents/actions",
],

function(FauxtonAPI, ViewEditor, Actions) {

  var Views = {};

  Views.ViewEditorReact = FauxtonAPI.View.extend({
    initialize: function (options) {
      this.options = options;
    },

    afterRender: function () {
      Actions.editIndex(this.options);
      ViewEditor.renderEditor(this.el);
    },

    cleanup: function () {
      ViewEditor.removeEditor(this.el);
    }
  });

  return Views;
});
