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
  '../../app',
  '../../core/api'
],
function (app, FauxtonAPI) {

  var Cluster = FauxtonAPI.addon();

  Cluster.ClusterNodes = Backbone.Model.extend({
    url: function () {
      return app.host + '/_membership';
    },

    parse: function (res) {
      var list;

      list = res.all_nodes.reduce(function (acc, node) {
        var isInCluster = res.cluster_nodes.indexOf(node) !== -1;

        acc.push({node: node, isInCluster: isInCluster});
        return acc;
      }, []);

      res.nodes_mapped = list;
      return res;
    }
  });

  return Cluster;
});
