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
  'addons/verifyinstall/resources',
  'addons/verifyinstall/actions',
  'addons/verifyinstall/components.react'
],
function (app, FauxtonAPI, VerifyInstall, Actions, Components) {

  var VerifyRouteObject = FauxtonAPI.RouteObject.extend({
    layout: 'one_pane',

    routes: {
      'verifyinstall': 'verifyInstall'
    },
    selectedHeader: 'Verify',

    verifyInstall: function () {
      Actions.resetStore();
      this.setComponent('#dashboard-content', Components.VerifyInstallController);
    },

    crumbs: [{name: 'Verify CouchDB Installation', link: '#'}]
  });

  VerifyInstall.RouteObjects = [VerifyRouteObject];

  return VerifyInstall;
});
