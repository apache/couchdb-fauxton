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

import app from "../../app";
import FauxtonAPI from "../../core/api";
import VerifyInstall from "./resources";
import Actions from "./actions";
import Components from "./components.react";

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

  crumbs: [{name: 'Verify CouchDB Installation'}]
});

VerifyInstall.RouteObjects = [VerifyRouteObject];

export default VerifyInstall;
