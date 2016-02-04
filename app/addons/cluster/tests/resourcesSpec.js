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
  '../../../../test/mocha/testUtils',
  '../../../core/api',
  '../resources',
], function (testUtils, FauxtonAPI, Resources) {
  var assert = testUtils.assert;


  describe('Membership Model', function () {
    var data = {
      'all_nodes': ['node1@127.0.0.1', 'node2@127.0.0.1', 'node3@127.0.0.1', 'notpartofclusternode'],
      'cluster_nodes': ['node1@127.0.0.1', 'node2@127.0.0.1', 'node3@127.0.0.1']
    };

    it('reorders the data', function () {
      var memberships = new Resources.ClusterNodes();
      var res = memberships.parse(data);

      assert.deepEqual([
        {node: 'node1@127.0.0.1', isInCluster: true},
        {node: 'node2@127.0.0.1', isInCluster: true},
        {node: 'node3@127.0.0.1', isInCluster: true},
        {node: 'notpartofclusternode', isInCluster: false}
      ],
      res.nodes_mapped);
    });

    it('keeps the exiting data', function () {
      var memberships = new Resources.ClusterNodes();
      var res = memberships.parse(data);

      assert.deepEqual([
        'node1@127.0.0.1',
        'node2@127.0.0.1',
        'node3@127.0.0.1',
        'notpartofclusternode'
      ],
      res.all_nodes);

      assert.deepEqual([
        'node1@127.0.0.1',
        'node2@127.0.0.1',
        'node3@127.0.0.1'
      ],
      res.cluster_nodes);
    });
  });
});
