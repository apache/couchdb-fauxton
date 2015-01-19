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
  'addons/fauxton/components.react',
  'addons/fauxton/actions',
  'testUtils',
  "react"
], function (FauxtonAPI, Views, Actions, utils, React) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;

  describe('NavBar', function () {

    describe('burger', function () {
      var container, burgerEl, toggleMenu;

      beforeEach(function () {
        toggleMenu = sinon.spy();
        container = document.createElement('div');
        burgerEl = TestUtils.renderIntoDocument(<Views.Burger toggleMenu={toggleMenu} />, container);
      });

      afterEach(function () {
        React.unmountComponentAtNode(container);
      });

      it('dispatch TOGGLE_NAVBAR_MENU on click', function () {
        TestUtils.Simulate.click(burgerEl.getDOMNode());
        assert.ok(toggleMenu.calledOnce);
      });

    });
  });

});

