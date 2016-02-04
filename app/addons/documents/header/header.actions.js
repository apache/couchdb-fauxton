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
  '../../../app',
  '../../../core/api',
  './header.actiontypes',
  '../queryoptions/actions',

],
function (app, FauxtonAPI, ActionTypes, ActionsQueryOptions) {

  return {

    toggleIncludeDocs: function (state, bulkDocsCollection) {
      var params = app.getParams();

      if (state) {
        delete params.include_docs;
      } else {
        params.include_docs = true;
      }

      app.utils.localStorageSet('include_docs_bulkdocs', bulkDocsCollection.toJSON());

      ActionsQueryOptions.runQuery(params);
    },

    toggleTableView: function (state) {
      FauxtonAPI.dispatch({
        type: ActionTypes.TOGGLE_TABLEVIEW,
        options: {
          enable: state
        }
      });
    }

  };
});
