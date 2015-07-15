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
  'addons/cluster/resources',
  'addons/cluster/cluster.react',
  'addons/cluster/cluster.actions',
],

function (app, FauxtonAPI, Cluster, ClusterComponents, ClusterActions) {


  var ConfigDisabledRouteObject = FauxtonAPI.RouteObject.extend({
    layout: 'one_pane',

    routes: {
      'cluster/disabled': 'showDisabledFeatureScreen',
    },

    crumbs: [
      { name: 'Config disabled', link: '_config' }
    ],

    apiUrl: function () {
      return [this.memberships.url(), this.memberships.documentation];
    },

    initialize: function () {
      this.memberships = new Cluster.ClusterNodes();
    },

    showDisabledFeatureScreen: function () {
      ClusterActions.fetchNodes();
      this.warning = this.setComponent('#dashboard-content', ClusterComponents.DisabledConfigController);
    }
  });

  Cluster.RouteObjects = [ConfigDisabledRouteObject];

  return Cluster;
});
