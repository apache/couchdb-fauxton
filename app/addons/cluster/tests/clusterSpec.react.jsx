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
  'api',
  'addons/cluster/cluster.react',
  'addons/cluster/cluster.actions',
  'addons/cluster/cluster.stores',
  'testUtils',
  'react',
  'react-dom'
], function (FauxtonAPI, ClusterComponent, ClusterActions, ClusterStores, utils, React, ReactDOM) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;

  describe('Cluster Controller', function () {
    var container, controller;

    beforeEach(function () {

      var nodeList = [
        {'node': 'node1@127.0.0.1', 'isInCluster': true},
        {'node': 'node2@127.0.0.1', 'isInCluster': true},
        {'node': 'node3@127.0.0.1', 'isInCluster': false},
        {'node': 'node3@127.0.0.1', 'isInCluster': false},
        {'node': 'node3@127.0.0.1', 'isInCluster': false},
        {'node': 'node3@127.0.0.1', 'isInCluster': false}
      ];

      ClusterActions.updateNodes({nodes: nodeList});

      container = document.createElement('div');
      controller = TestUtils.renderIntoDocument(
        <ClusterComponent.DisabledConfigController />,
        container
      );
    });

    afterEach(function () {
      ClusterStores.nodesStore.reset();
      ReactDOM.unmountComponentAtNode(container);
    });

    it('renders the amount of nodes', function () {
      assert.ok(/6 nodes/.test($(ReactDOM.findDOMNode(controller)).text()), 'finds 6 nodes');
    });
  });
});
