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
  "app",
  "api",
  "addons/dashboard/resources",
  "addons/dashboard/components.react",
  'addons/activetasks/resources',
  'addons/activetasks/actions'
],

function (app, FauxtonAPI, Resources, Components, ActiveTasksResources, Actions) {

  var DashboardRoutObject = FauxtonAPI.RouteObject.extend({
    layout : 'one_pane',

    crumbs: [
      {"name": "Dashboard", "link": "/dashboard"}
    ],

    routes: {
      "": "showDashboard",
      "index.html": "showDashboard",
      "dashboard": "showDashboard"
    },

    selectedHeader: "Dashboard",

    initialize: function () {
      this.allTasks = new ActiveTasksResources.AllTasks();
    },

    showDashboard: function () {
      Actions.fetchAndSetActiveTasks(this.allTasks);

      this.setComponent("#dashboard-content", Components.DashboardController);
    }
  });

  Resources.RouteObjects = [DashboardRoutObject];

  return Resources;
});
