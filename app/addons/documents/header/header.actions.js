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
  'app',
  'api',
  'addons/documents/header/header.actiontypes'
],
function (app, FauxtonAPI, ActionTypes) {

  return {
    toggleCollapseDocuments: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.COLLAPSE_DOCUMENTS
      });

      FauxtonAPI.Events.trigger('headerbar:collapse');
    },

    toggleSelectAllDocuments: function (on) {
      FauxtonAPI.Events.trigger('headerbar:selectall', on);
    },

    updateDocumentCount: function (options) {
      FauxtonAPI.dispatch({
        type: ActionTypes.UPDATE_DOCUMENT_COUNT,
        options: options
      });
    },

    deleteSelected: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.DELETE_SELECTED
      });

      FauxtonAPI.Events.trigger('headerbar:deleteselected');
    },

    toggleHeaderControls: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.TOGGLE_HEADER_CONTROLS
      });
    },

    resetHeaderController: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.RESET_HEADER_BAR
      });
    }

  };
});
