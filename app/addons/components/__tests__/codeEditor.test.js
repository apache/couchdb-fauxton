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
import React from "react";
import {mount} from 'enzyme';
import sinon from "sinon";

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
      expect(codeEditorEl.instance().hasChanged()).toBeFalsy();
    });

    it('detects change on user input', () => {
      codeEditorEl.instance().editor.setValue(code2, -1);
      expect(codeEditorEl.instance().hasChanged()).toBeTruthy();
    });
  });

  describe('onBlur', () => {
    it('calls blur function', () => {
      codeEditorEl.instance().editor._emit('blur');
      expect(spy.calledOnce).toBeTruthy();
    });
  });

  describe('setHeightToLineCount', () => {
    it('check default num lines #1', () => {
      codeEditorEl = mount(
        <ReactComponents.CodeEditor defaultCode={code} setHeightToLineCount={true} />
      );
      codeEditorEl.update();
      expect(codeEditorEl.instance().editor.getSession().getDocument().getLength()).toBe(3);
    });
    it('check default num lines #2', () => {
      codeEditorEl = mount(
        <ReactComponents.CodeEditor defaultCode={code2} setHeightToLineCount={true} />
      );
      expect(codeEditorEl.instance().editor.getSession().getDocument().getLength()).toBe(5);
    });
    // Skipping because the maxLines option is not working in the ACE editor
    it.skip('check maxLines', () => {
      codeEditorEl = mount(
        <ReactComponents.CodeEditor defaultCode={code2} setHeightToLineCount={true} maxLines={2} />
      );
      expect(codeEditorEl.instance().editor.getSession().getDocument().getLength()).toBe(2);
    });
  });

  describe('removeIncorrectAnnotations', () => {
    beforeEach(() => {
      codeEditorEl = mount(
        <ReactComponents.CodeEditor defaultCode={code} ignorableErrors={ignorableErrors} />
      );
    });
    it('removes default errors that do not apply to CouchDB Views', () => {
      expect(codeEditorEl.instance().getAnnotations()).toEqual([]);
    });
  });

  describe('getEditor', () => {
    beforeEach(() => {
      codeEditorEl = mount(
        <ReactComponents.CodeEditor defaultCode={code} />
      );
    });
    it('returns a reference to get access to the editor', () => {
      expect(codeEditorEl.instance().getEditor()).toBeTruthy();
    });
  });

  describe('parseLineForStringMatch', () => {
    const initEditor = (code) => {
      const editor = mount(
        <ReactComponents.CodeEditor defaultCode={code} />
      );
      sinon.stub(editor.instance(), 'getSelectionStart').returns({row: 1});
      sinon.stub(editor.instance(), 'getSelectionEnd').returns({row: 1});
      sinon.stub(editor.instance(), 'isRowExpanded').returns(true);
      return editor;
    };

    it('returns matches on pretty formatted code', () => {
      const code = '{\n "field": "my string value" \n}';
      codeEditorEl = initEditor(code);
      const matches = codeEditorEl.instance().parseLineForStringMatch();
      expect('"my string value" ').toBe(matches[3]);
    });
    it('returns matches when line ends with comma', () => {
      const code = '{\n "field": "my string value", \n "field2": 123 \n}';
      codeEditorEl = initEditor(code);
      const matches = codeEditorEl.instance().parseLineForStringMatch();
      expect('"my string value", ').toBe(matches[3]);
    });
    it('returns matches on code with extra spaces', () => {
      const code = '{\n "field"  \t :  \t "my string value"  \t  ,  \t  \n "field2": 123 \n}';
      codeEditorEl = initEditor(code);
      const matches = codeEditorEl.instance().parseLineForStringMatch();
      expect('"my string value"  \t  ,  \t  ').toBe(matches[3]);
    });
    it('returns matches on code with special and non-ASCII chars', () => {
      const code = '{\n "@langua漢字g e" : "my string value",\n "field2": 123 \n}';
      codeEditorEl = initEditor(code);
      const matches = codeEditorEl.instance().parseLineForStringMatch();
      expect('"my string value",').toBe(matches[3]);
    });
  });

});
