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
  var code2 = 'function (doc) {\n if(doc._id) { \n emit(doc._id, 2); \n } \n}';

  describe('Code Editor', function () {
    var container, codeEditorEl;

    beforeEach(function () {
      container = document.createElement('div');
      codeEditorEl = TestUtils.renderIntoDocument(
        React.createElement(ReactComponents.CodeEditor, {code: code}),
        container
      );
    });

    afterEach(function () {
      React.unmountComponentAtNode(container);
    });

    describe('Tracking edits', function () {

      it('no change on mount', function () {
        assert.notOk(codeEditorEl.hasChanged());
      });

      it('no change on update', function () {
        codeEditorEl.setProps({code: code2});

        assert.notOk(codeEditorEl.hasChanged());
      });

      it('detects change on user input', function () {
        codeEditorEl.editor.setValue(code2, -1);

        assert.ok(codeEditorEl.hasChanged());
      });

    });

    describe('setHeightToLineCount', function () {

      beforeEach(function () {
        codeEditorEl = TestUtils.renderIntoDocument(
          React.createElement(ReactComponents.CodeEditor, {code: code, isFullPageEditor: false, setHeightWithJS: true}),
          container
        );

      });

      it('sets line height correctly for non full page', function () {
        var spy = sinon.spy(codeEditorEl.editor, 'setOptions');

        codeEditorEl.setHeightToLineCount();
        assert.ok(spy.calledOnce);
        assert.equal(spy.getCall(0).args[0].maxLines, 3);
      });

    });

    describe('removeIncorrectAnnotations', function () {

      beforeEach(function () {
        codeEditorEl = TestUtils.renderIntoDocument(
          React.createElement(ReactComponents.CodeEditor, {code: code}),
          container
        );

      });

      it('removes default errors that do not apply to CouchDB Views', function () {
        assert.equal(codeEditorEl.getAnnotations(), 0);
      });

    });

    describe('setEditorValue', function () {

      it('sets new code', function () {
        codeEditorEl = TestUtils.renderIntoDocument(
          React.createElement(ReactComponents.CodeEditor, {code: code}),
          container
        );

        codeEditorEl.setEditorValue(code2);
        assert.deepEqual(codeEditorEl.getValue(), code2);
      });

    });

    //I cannot get these to work as I cannot get the mode-javascript to load
    /*describe('hadValidCode', function () {

      it('returns true for valid code', function () {
        codeEditorEl = TestUtils.renderIntoDocument(
          <ReactComponents.CodeEditor code={code}/>,
          container
        );

        assert.ok(codeEditorEl.hadValidCode());
      });

      it('returns false for invalid code', function (done) {
        var badCode = 'function () \n { emit( \n';
        codeEditorEl = TestUtils.renderIntoDocument(
          <ReactComponents.CodeEditor code={code}/>,
          container
        );
        codeEditorEl.editor.getSession().on("changeAnnotation", function () {
          console.log('aa2', codeEditorEl.getValue(), codeEditorEl.getAnnotations());
          assert.notOk(codeEditorEl.hadValidCode());
          done();
        });

        codeEditorEl.setEditorValue(badCode);
      });
    });*/

  });
});
