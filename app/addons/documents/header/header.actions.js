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
    collapseDocuments: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.COLLAPSE_DOCUMENTS
      });
    },

    unCollapseDocuments: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.EXPAND_DOCUMENTS
      });
    },

    collapseAllDocuments: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.COLLAPSE_ALL_DOCUMENTS
      });
    },

    unCollapseAllDocuments: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.EXPAND_ALL_DOCUMENTS
      });
    },

    enableTableView: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.ENABLE_TABLE_VIEW
      });
    },

    disableTableView: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.DISABLE_TABLE_VIEW
      });
    },

  };
});
