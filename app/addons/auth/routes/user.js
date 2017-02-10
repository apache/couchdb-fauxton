import React from "react";
import FauxtonAPI from "../../../core/api";
import ClusterActions from "../../cluster/cluster.actions";
import { AdminLayout } from "./../layout";
import { selectPage } from './../actions';

export default FauxtonAPI.RouteObject.extend({
  layout: "empty",
  hideNotificationCenter: true,
  hideApiBar: true,
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
  selectedHeader() {
    return FauxtonAPI.session.user.name;
  },
  changePassword() {
    ClusterActions.fetchNodes();
    selectPage("changePassword");
    return (
      <AdminLayout
        crumbs={[{ name: "User Management" }]}
        changePassword={true}
      />
    );
  },
  addAdmin() {
    ClusterActions.fetchNodes();
    selectPage("addAdmin");
    return (
      <AdminLayout
        crumbs={[{ name: "User Management" }]}
        changePassword={false}
      />
    );
  }
});
