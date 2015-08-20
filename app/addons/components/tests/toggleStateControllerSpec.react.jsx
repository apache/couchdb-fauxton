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
  'addons/components/react-components.react',

  'testUtils',
  'react'
], function (FauxtonAPI, ReactComponents, utils, React) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;

  describe('ToggleStateController for multiple toggles', function () {
    var container, toggleController;

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      React.unmountComponentAtNode(container);
    });

    var buttons = [
      {labelText: 'Table', id: 'a', onClick: function () {}, selected: true},
      {labelText: 'JSON', id: 'b', onClick: function () {}, selected: false},
      {labelText: 'meh', id: 'meh', onClick: function () {}, selected: false}
    ];

    it('renders three buttons', function () {
      toggleController = TestUtils.renderIntoDocument(
        <ReactComponents.ToggleStateController title="Preview View" buttons={buttons} />,
        container
      );

      var $controller = $(toggleController.getDOMNode());

      assert.equal($controller.find('label').length, 3);
    });

    it('preselects a button if selected = true', function () {
      toggleController = TestUtils.renderIntoDocument(
        <ReactComponents.ToggleStateController title="Preview View" buttons={buttons} />,
        container
      );

      var $controller = $(toggleController.getDOMNode());

      assert.equal($controller.find('#toggle-state-id-a:checked').length, 1);
    });

    it('toggles to another button if clicked on label', function () {
      toggleController = TestUtils.renderIntoDocument(
        <ReactComponents.ToggleStateController title="Preview View" buttons={buttons} />,
        container
      );

      var $controller = $(toggleController.getDOMNode());
      assert.equal($controller.find('#toggle-state-id-a:checked').length, 1);

      TestUtils.Simulate.change($controller.find('#toggle-state-id-meh')[0], {target: {value: 'Helloo'}});


      assert.equal($controller.find('#toggle-state-id-a:checked').length, 0);
      assert.equal($controller.find('#toggle-state-id-meh:checked').length, 1);
    });
  });
});
