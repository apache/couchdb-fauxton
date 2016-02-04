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

  describe('PaddedBorderedBox', function () {
    var container, el;

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('hosts child elements', function () {
      el = TestUtils.renderIntoDocument(
        <ReactComponents.PaddedBorderedBox>
          <div className="foo-children"></div>
        </ReactComponents.PaddedBorderedBox>,
        container
      );
      assert.ok($(ReactDOM.findDOMNode(el)).find('.foo-children').length);
    });
  });
});
