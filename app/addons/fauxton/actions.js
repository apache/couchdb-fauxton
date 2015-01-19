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
  'addons/fauxton/actiontypes'
],
function (app, FauxtonAPI, ActionTypes) {

  return {
    toggleNavbarMenu: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.TOGGLE_NAVBAR_MENU 
      });
    },

    addHeaderLink: function (link) {
      FauxtonAPI.dispatch({
        type: ActionTypes.ADD_NAVBAR_LINK,
        link: link
      });
    },

    removeHeaderLink: function(link) {
      FauxtonAPI.dispatch({
        type: ActionTypes.REMOVE_NAVBAR_LINK,
        link: link
      });
    },

    setNavbarVersionInfo: function (versionInfo) {
      FauxtonAPI.dispatch({
        type: ActionTypes.NAVBAR_SET_VERSION_INFO,
        version: versionInfo
      });
    },

    setNavbarActiveLink: function (header) {
      FauxtonAPI.dispatch({
        type: ActionTypes.NAVBAR_ACTIVE_LINK,
        name: header
      });
    }
  };
});

