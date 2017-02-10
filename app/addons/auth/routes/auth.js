import React from "react";
import FauxtonAPI from "../../../core/api";
import ClusterActions from "../../cluster/cluster.actions";
import { AuthLayout } from "./../layout";
import app from "../../../app";
import Components from "./../components";

const {
  LoginForm,
  CreateAdminForm
} = Components;

const crumbs = [{ name: "Log In to CouchDB" }];

export default FauxtonAPI.RouteObject.extend({
  layout: "empty",
  routes: {
    "login?*extra": "login",
    login: "login",
    logout: "logout",
    createAdmin: "checkNodes",
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
    FauxtonAPI.addNotification({ msg: "You have been logged out." });
    FauxtonAPI.session.logout().then(() => FauxtonAPI.navigate("/"));
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
