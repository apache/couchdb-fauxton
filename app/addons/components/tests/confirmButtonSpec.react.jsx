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

  describe('ConfirmButton', function () {
    var container, button;
    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      React.unmountComponentAtNode(container);
    });

    it('should render text properties', function () {
      button = TestUtils.renderIntoDocument(
        <ReactComponents.ConfirmButton text="Click here to render Rocko Artischocko" />,
        container
      );
      assert.equal($(button.getDOMNode()).text(), 'Click here to render Rocko Artischocko');
    });
  });
});
