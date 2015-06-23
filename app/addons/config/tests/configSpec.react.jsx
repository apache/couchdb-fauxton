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
  'addons/config/config.react',
  'addons/config/config.actions',

  'testUtils',
  'react'
], function (FauxtonAPI, ConfigComponents, ConfigActions, utils, React) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;

  describe('Config Controller', function () {
    var container, controller;

    beforeEach(function () {

      var nodeList = [
        {'node': 'node1@127.0.0.1', 'isInCluster': true},
        {'node': 'node2@127.0.0.1', 'isInCluster': true},
        {'node': 'node3@127.0.0.1', 'isInCluster': false}
      ];

      ConfigActions.updateNodes({nodes: nodeList});

      container = document.createElement('div');
      controller = TestUtils.renderIntoDocument(
        <ConfigComponents.ConfigController />,
        container
      );
    });

    afterEach(function () {
      React.unmountComponentAtNode(container);
    });

    it('should render a list of nodes to links', function () {
      assert.equal($(controller.getDOMNode()).find('a').length, 3);
      var textContent = $(controller.getDOMNode()).text();
      assert.ok(/node1@127\.0\.0\.1/.test(textContent));
    });

    it('should render just two checkmarks if 2 from 3 nodes are in a cluster', function () {
      assert.equal($(controller.getDOMNode()).find('i').length, 2);
    });
  });
});
