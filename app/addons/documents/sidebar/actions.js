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
  'addons/documents/sidebar/actiontypes',
  'addons/documents/sidebar/stores'
],
function (app, FauxtonAPI, ActionTypes, Stores) {
  var store = Stores.sidebarStore;

  return {
    newOptions: function (options) {
      if (options.database.safeID() !== store.getDatabaseName()) {
        FauxtonAPI.dispatch({
          type: ActionTypes.SIDEBAR_FETCHING
        });
      }

      options.designDocs.fetch().then(function () {
        FauxtonAPI.dispatch({
          type: ActionTypes.SIDEBAR_NEW_OPTIONS,
          options: options
        });
      });
    },

    toggleContent: function (designDoc, indexGroup) {
      FauxtonAPI.dispatch({
        type: ActionTypes.SIDEBAR_TOGGLE_CONTENT,
        designDoc: designDoc,
        indexGroup: indexGroup
      });
    },

    // This selects any item in the sidebar, including nested nav items to ensure the appropriate item is visible
    // and highlighted. Params:
    // - `navItem`: 'permissions', 'changes', 'all-docs', 'compact', 'mango-query', 'designDoc' (or anything thats been
    //    extended)
    // - `params`: optional object if you passed designDoc as the first param. This lets you specify which sub-page
    //    should be selected, e.g.
    //       Actions.selectNavItem('designDoc', { designDocName: 'my-design-doc', section: 'metadata' });
    //       Actions.selectNavItem('designDoc', { designDocName: 'my-design-doc', section: 'Views', indexName: 'my-view' });
    selectNavItem: function (navItem, params) {
      var settings = $.extend(true, {}, {
        designDocName: '',
        designDocSection: '',
        indexName: ''
      }, params);
      settings.navItem = navItem;

      FauxtonAPI.dispatch({
        type: ActionTypes.SIDEBAR_SET_SELECTED_NAV_ITEM,
        options: settings
      });
    },

    refresh: function () {
      FauxtonAPI.dispatch({ type: ActionTypes.SIDEBAR_REFRESH });
    }
  };
});
