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
  'api',
  'addons/components/actiontypes'
],
function (FauxtonAPI, ActionTypes) {

  function showAPIBar () {
    FauxtonAPI.dispatch({ type: ActionTypes.SHOW_API_BAR });
  }

  function hideAPIBar () {
    FauxtonAPI.dispatch({ type: ActionTypes.HIDE_API_BAR });
  }

  // general usage for setting multiple params at once. If a param isn't passed, it's not overridden
  function updateAPIBar (params) {
    FauxtonAPI.dispatch({
      type: ActionTypes.UPDATE_API_BAR,
      options: {
        visible: params.visible,
        endpoint: params.endpoint,
        docURL: params.docURL
      }
    });
  }

  return {
    showAPIBar: showAPIBar,
    hideAPIBar: hideAPIBar,
    updateAPIBar: updateAPIBar
  };

});
