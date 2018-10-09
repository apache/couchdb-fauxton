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

import React from "react";
import FauxtonAPI from "../../../core/api";
import ClusterActions from "../../cluster/actions";
import { AdminLayout } from "./../layout";

export default FauxtonAPI.RouteObject.extend({
  hideNotificationCenter: true,
  hideApiBar: true,
  selectedHeader: 'Your Account',

  routes: {
    changePassword: {
      route: "checkNodesForPasswordChange",
      roles: ["fx_loggedIn"]
    },
    "changePassword/:node": {
      route: "changePassword",
      roles: ["fx_loggedIn"]
    },
    addAdmin: {
      route: "checkNodesForAddAdmin",
      roles: ["_admin"]
    },
    "addAdmin/:node": {
      route: "addAdmin",
      roles: ["_admin"]
    }
  },

  checkNodesForPasswordChange() {
    ClusterActions.navigateToNodeBasedOnNodeCount("/changePassword/");
  },

  checkNodesForAddAdmin() {
    ClusterActions.navigateToNodeBasedOnNodeCount("/addAdmin/");
  },

  changePassword() {
    ClusterActions.fetchNodes();
    return (
      <AdminLayout
        crumbs={[{ name: "User Management" }]}
        changePassword={true}
      />
    );
  },
  addAdmin() {
    ClusterActions.fetchNodes();
    return (
      <AdminLayout
        crumbs={[{ name: "User Management" }]}
        changePassword={false}
      />
    );
  }
});
