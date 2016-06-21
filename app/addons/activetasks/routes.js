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
import ActiveTasksResources from "./resources";
import ActiveTasksComponents from "./components.react";
import Actions from "./actions";

var ActiveTasksRouteObject = FauxtonAPI.RouteObject.extend({
  selectedHeader: 'Active Tasks',
  layout: 'one_pane',
  disableLoader: true,
  routes: {
    'activetasks/:id': 'showActiveTasks',
    'activetasks': 'showActiveTasks'
  },
  crumbs: [
    {'name': 'Active Tasks'}
  ],
  apiUrl: function () {
    var apiurl = window.location.origin + '/_active_tasks';
    return [apiurl, FauxtonAPI.constants.DOC_URLS.ACTIVE_TASKS];
  },
  roles: ['_admin'],
  initialize: function () {
    this.allTasks = new ActiveTasksResources.AllTasks();
  },
  showActiveTasks: function () {
    Actions.init(this.allTasks);
    this.setComponent('#dashboard-content', ActiveTasksComponents.ActiveTasksController);
    this.setComponent('#right-header', ActiveTasksComponents.ActiveTasksPollingWidgetController);
  }
});

ActiveTasksResources.RouteObjects = [ActiveTasksRouteObject];

export default ActiveTasksResources;
