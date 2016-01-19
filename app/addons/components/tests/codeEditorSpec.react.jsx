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
  'react',
  'react-dom'
], function (FauxtonAPI, ReactComponents, utils, React, ReactDOM) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;
  var code = 'function (doc) {\n  emit(doc._id, 1);\n}';
  var code2 = 'function (doc) {\n if(doc._id) { \n emit(doc._id, 2); \n } \n}';

  var ignorableErrors = [
    'Missing name in function declaration.',
    "['{a}'] is better written in dot notation."
  ];

  describe('Code Editor', function () {
    var container, codeEditorEl, spy;

    beforeEach(function () {
      spy = sinon.spy();
      container = document.createElement('div');
      codeEditorEl = TestUtils.renderIntoDocument(
        <ReactComponents.CodeEditor defaultCode={code} blur={spy} />,
        container
      );
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    describe('Tracking edits', function () {
      it('no change on mount', function () {
        assert.notOk(codeEditorEl.hasChanged());
      });

      it('detects change on user input', function () {
        codeEditorEl.editor.setValue(code2, -1);
        assert.ok(codeEditorEl.hasChanged());
      });
    });

    describe('onBlur', function () {
      it('calls blur function', function () {
        codeEditorEl.editor._emit('blur');
        assert.ok(spy.calledOnce);
      });
    });

    describe('setHeightToLineCount', function () {
      it('check default num lines #1', function () {
        codeEditorEl = TestUtils.renderIntoDocument(
          <ReactComponents.CodeEditor code={code} setHeightToLineCount={true} />,
          container
        );
        assert.ok(codeEditorEl.editor.getSession().getDocument().getLength(), 3);
      });
      it('check default num lines #2', function () {
        codeEditorEl = TestUtils.renderIntoDocument(
          <ReactComponents.CodeEditor code={code2} setHeightToLineCount={true} />,
          container
        );
        assert.ok(codeEditorEl.editor.getSession().getDocument().getLength(), 5);
      });
      it('check maxLines', function () {
        codeEditorEl = TestUtils.renderIntoDocument(
          <ReactComponents.CodeEditor code={code2} setHeightToLineCount={true} maxLines={2} />,
          container
        );
        assert.ok(codeEditorEl.editor.getSession().getDocument().getLength(), 2);
      });
    });

    describe('removeIncorrectAnnotations', function () {
      beforeEach(function () {
        codeEditorEl = TestUtils.renderIntoDocument(
          <ReactComponents.CodeEditor defaultCode={code} ignorableErrors={ignorableErrors} />,
          container
        );
      });
      it('removes default errors that do not apply to CouchDB Views', function () {
        assert.equal(codeEditorEl.getAnnotations(), 0);
      });
    });

    describe('getEditor', function () {
      beforeEach(function () {
        codeEditorEl = TestUtils.renderIntoDocument(
          <ReactComponents.CodeEditor defaultCode={code} />,
          container
        );
      });
      it('returns a reference to get access to the editor', function () {
        assert.ok(codeEditorEl.getEditor());
      });
    });

  });
});
