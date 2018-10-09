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
import { AuthLayout } from "./../layout";
import app from "../../../app";
import Components from "./../components";
import {logout} from '../actions';

const {
  LoginForm,
  CreateAdminForm
} = Components;

const crumbs = [{ name: "Log In to CouchDB" }];

export default FauxtonAPI.RouteObject.extend({
  routes: {
    "login?*extra": "login",
    "login": "login",
    "logout": "logout",
    "createAdmin": "checkNodes",
    "createAdmin/:node": "createAdminForNode"
  },
  checkNodes() {
    ClusterActions.navigateToNodeBasedOnNodeCount("/createAdmin/");
  },
  login() {
    return (
      <AuthLayout
        crumbs={crumbs}
        component={<LoginForm urlBack={app.getParams().urlback} />}
      />
    );
  },
  logout() {
    logout();
  },
  createAdminForNode() {
    ClusterActions.fetchNodes();
    const crumbs = [{ name: "Create Admin" }];
    return (
      <AuthLayout
        crumbs={crumbs}
        component={<CreateAdminForm loginAfter={true} />}
      />
    );
  }
});
