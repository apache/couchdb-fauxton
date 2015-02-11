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
  'addons/documents/changes/actiontypes'
],
function (app, FauxtonAPI, ActionTypes) {

  return {
    toggleTabVisibility: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.TOGGLE_CHANGES_TAB_VISIBILITY
      });
    },

    addFilter: function (filter) {
      FauxtonAPI.dispatch({
        type: ActionTypes.ADD_CHANGES_FILTER_ITEM,
        filter: filter
      });

      // TODO for backward compatibility. Remove later.
      FauxtonAPI.triggerRouteEvent('changesFilterAdd', filter);
    },

    removeFilter: function (filter) {
      FauxtonAPI.dispatch({
        type: ActionTypes.REMOVE_CHANGES_FILTER_ITEM,
        filter: filter
      });

      // TODO for backward compatibility. Remove later.
      FauxtonAPI.triggerRouteEvent('changesFilterRemove', filter);
    }
  };

});
