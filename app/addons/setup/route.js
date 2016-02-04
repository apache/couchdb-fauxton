// Licensed under the Apache License, Version 2.0 (the 'License'); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

define([
  '../../app',
  '../../core/api',
  './resources',
  './setup.react',
  './setup.actions',
  '../cluster/cluster.actions',

],
function (app, FauxtonAPI, Setup, SetupComponents, SetupActions, ClusterActions) {
  var RouteObject = FauxtonAPI.RouteObject.extend({
    layout: 'one_pane',

    roles: ['_admin'],

    routes: {
      'setup': 'setupInitView',
      'setup/finish': 'finishView',
      'setup/singlenode': 'setupSingleNode',
      'setup/multinode': 'setupMultiNode'
    },

    crumbs: [
      {'name': 'Setup ' + app.i18n.en_US['couchdb-productname'], 'link': 'setup'}
    ],

    apiUrl: function () {
      return [this.setupModel.url(), this.setupModel.documentation];
    },

    initialize: function () {
      this.setupModel = new Setup.Model();
    },

    setupInitView: function () {
      ClusterActions.fetchNodes();
      SetupActions.getClusterStateFromCouch();
      this.setComponent('#dashboard-content', SetupComponents.SetupFirstStepController);
    },

    setupSingleNode: function () {
      ClusterActions.fetchNodes();
      this.setComponent('#dashboard-content', SetupComponents.SetupSingleNodeController);
    },

    setupMultiNode: function () {
      ClusterActions.fetchNodes();
      this.setComponent('#dashboard-content', SetupComponents.SetupMultipleNodesController);
    },

    finishView: function () {
      this.setComponent('#dashboard-content', SetupComponents.ClusterConfiguredScreen);
    }
  });


  Setup.RouteObjects = [RouteObject];

  return Setup;
});
