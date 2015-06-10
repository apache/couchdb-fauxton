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
  var code = 'function (doc) {\n  emit(doc._id, 1);\n}';

  describe('CodeEditorPanel', function () {

    describe('Doc icon', function () {
      it('hidden by default', function () {
        var container = document.createElement('div');
        var codeEditorEl = TestUtils.renderIntoDocument(
          <ReactComponents.CodeEditorPanel defaultCode={code} />,
          container
        );
        assert.equal($(codeEditorEl.getDOMNode()).find('.icon-question-sign').length, 0);
      });
      it('hidden by default', function () {
        var container = document.createElement('div');
        var codeEditorEl = TestUtils.renderIntoDocument(
          <ReactComponents.CodeEditorPanel defaultCode={code} docLink="http://link.com" />,
          container
        );
        assert.equal($(codeEditorEl.getDOMNode()).find('.icon-question-sign').length, 1);
      });
    });

    describe('Zen Mode', function () {
      it('shows zen mode by default', function () {
        var container = document.createElement('div');
        var codeEditorEl = TestUtils.renderIntoDocument(
          <ReactComponents.CodeEditorPanel defaultCode={code} />,
          container
        );
        assert.equal($(codeEditorEl.getDOMNode()).find('.zen-editor-icon').length, 1);
      });

      it('omits zen mode if explicitly turned off', function () {
        var container = document.createElement('div');
        var codeEditorEl = TestUtils.renderIntoDocument(
          <ReactComponents.CodeEditor defaultCode={code} allowZenMode={false} />,
          container
        );
        assert.equal($(codeEditorEl.getDOMNode()).find('.zen-editor-icon').length, 0);
      });
    });

  });

});
