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

  describe('Beautify', function () {
    var container, beautifyEl, reduceStub;

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      React.unmountComponentAtNode(container);
    });

    it('should be empty for multi-lined code', function () {
      var correctCode = 'function() {\n    console.log("hello");\n}';
      beautifyEl = TestUtils.renderIntoDocument(
        <ReactComponents.Beautify code={correctCode}/>,
        container
      );
      assert.ok(_.isNull(beautifyEl.getDOMNode()));
    });

    it('should have button to beautify for single line code', function () {
      var badCode = 'function () { console.log("hello"); }';
      beautifyEl = TestUtils.renderIntoDocument(<ReactComponents.Beautify code={badCode}/>, container);
      assert.ok($(beautifyEl.getDOMNode()).hasClass('beautify'));
    });

    it('on click beautifies code', function () {
      var fixedCode;
      var correctCode = 'function() {\n    console.log("hello");\n}';

      var beautifiedCode = function (code) {
        fixedCode = code;
      };

      beautifyEl = TestUtils.renderIntoDocument(
        <ReactComponents.Beautify
          beautifiedCode={beautifiedCode}
          code={'function() { console.log("hello"); }'}
          noOfLines={1}/>,
        container
      );
      TestUtils.Simulate.click(beautifyEl.getDOMNode());
      assert.equal(fixedCode, correctCode);

    });
  });
});
