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
import ReactComponents from "../react-components";
import utils from "../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import {mount} from 'enzyme';
import sinon from "sinon";

const assert = utils.assert;
var code = 'function (doc) {\n  emit(doc._id, 1);\n}';
var code2 = 'function (doc) {\n if(doc._id) { \n emit(doc._id, 2); \n } \n}';

var ignorableErrors = [
  'Missing name in function declaration.',
  "['{a}'] is better written in dot notation."
];

describe('Code Editor', () => {
  let codeEditorEl, spy;

  beforeEach(() => {
    spy = sinon.spy();

    codeEditorEl = mount(
      <ReactComponents.CodeEditor defaultCode={code} blur={spy} />
    );
  });

  describe('Tracking edits', () => {
    it('no change on mount', () => {
      assert.notOk(codeEditorEl.instance().hasChanged());
    });

    it('detects change on user input', () => {
      codeEditorEl.instance().editor.setValue(code2, -1);
      assert.ok(codeEditorEl.instance().hasChanged());
    });
  });

  describe('onBlur', () => {
    it('calls blur function', () => {
      codeEditorEl.instance().editor._emit('blur');
      assert.ok(spy.calledOnce);
    });
  });

  describe('setHeightToLineCount', () => {
    it('check default num lines #1', () => {
      codeEditorEl = mount(
        <ReactComponents.CodeEditor code={code} setHeightToLineCount={true} />
      );
      assert.ok(codeEditorEl.instance().editor.getSession().getDocument().getLength(), 3);
    });
    it('check default num lines #2', () => {
      codeEditorEl = mount(
        <ReactComponents.CodeEditor code={code2} setHeightToLineCount={true} />
      );
      assert.ok(codeEditorEl.instance().editor.getSession().getDocument().getLength(), 5);
    });
    it('check maxLines', () => {
      codeEditorEl = mount(
        <ReactComponents.CodeEditor code={code2} setHeightToLineCount={true} maxLines={2} />
      );
      assert.ok(codeEditorEl.instance().editor.getSession().getDocument().getLength(), 2);
    });
  });

  describe('removeIncorrectAnnotations', () => {
    beforeEach(() => {
      codeEditorEl = mount(
        <ReactComponents.CodeEditor defaultCode={code} ignorableErrors={ignorableErrors} />
      );
    });
    it('removes default errors that do not apply to CouchDB Views', () => {
      assert.equal(codeEditorEl.instance().getAnnotations(), 0);
    });
  });

  describe('getEditor', () => {
    beforeEach(() => {
      codeEditorEl = mount(
        <ReactComponents.CodeEditor defaultCode={code} />
      );
    });
    it('returns a reference to get access to the editor', () => {
      assert.ok(codeEditorEl.instance().getEditor());
    });
  });

});
