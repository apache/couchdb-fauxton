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
  '../../core/api',
  './resources',
  './cluster.actiontypes'
],
function (FauxtonAPI, ClusterResources, ActionTypes) {
  return {
    fetchNodes: function () {
      var memberships = new ClusterResources.ClusterNodes();

      memberships.fetch().then(function () {
        this.updateNodes({
          nodes: memberships.get('nodes_mapped')
        });
      }.bind(this));
    },

    updateNodes: function (options) {
      FauxtonAPI.dispatch({
        type: ActionTypes.CLUSTER_FETCH_NODES,
        options: options
      });
    },

    navigateToNodeBasedOnNodeCount: function (successtarget) {
      var memberships = new ClusterResources.ClusterNodes();

      memberships.fetch().then(function () {
        var nodes = memberships.get('all_nodes');

        if (nodes.length === 1) {
          return FauxtonAPI.navigate(successtarget + nodes[0]);
        }
        return FauxtonAPI.navigate('/cluster/disabled', {trigger: true});
      });
    }

  };
});
