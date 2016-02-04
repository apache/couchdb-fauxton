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
  '../../../core/api',
  '../react-components.react',
  '../../../../test/mocha/testUtils',
  'react',
  'react-dom',
  'react-addons-test-utils',
  'sinon'
], function (FauxtonAPI, ReactComponents, utils, React, ReactDOM, TestUtils, sinon) {

  var assert = utils.assert;

  describe('Header Togglebutton', function () {
    var container, toggleEl, toggleCallback;
    beforeEach(function () {
      container = document.createElement('div');
      toggleCallback = sinon.spy();
      toggleEl = TestUtils.renderIntoDocument(<ReactComponents.ToggleHeaderButton fonticon={'foo'}
        classString={'bar'} toggleCallback={toggleCallback} />, container);
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('should call the passed callback', function () {
      TestUtils.Simulate.click(ReactDOM.findDOMNode(toggleEl));
      assert.ok(toggleCallback.calledOnce);
    });
  });
});
