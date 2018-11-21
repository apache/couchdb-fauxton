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

var codeNoNewlines = 'function (doc) {emit(doc._id, 1);}';
var code = 'function (doc) {\n  emit(doc._id, 1);\n}';

describe('CodeEditorPanel', () => {

  describe('Doc icon', () => {
    it('hidden by default', () => {

      const codeEditorEl = mount(
        <ReactComponents.CodeEditorPanel defaultCode={code} />
      );
      expect(codeEditorEl.find('.icon-question-sign').length).toBe(0);
    });
    it('hidden by default', () => {

      const codeEditorEl = mount(
        <ReactComponents.CodeEditorPanel defaultCode={code} docLink="http://link.com" />
      );
      expect(codeEditorEl.find('.icon-question-sign').length).toBe(1);
    });
  });

  describe('Zen Mode', () => {
    it('shows zen mode by default', () => {

      const codeEditorEl = mount(
        <ReactComponents.CodeEditorPanel defaultCode={code} />
      );
      expect(codeEditorEl.find('.zen-editor-icon').length).toBe(1);
    });

    it('omits zen mode if explicitly turned off', () => {

      const codeEditorEl = mount(
        <ReactComponents.CodeEditor defaultCode={code} allowZenMode={false} />
      );
      expect(codeEditorEl.find('.zen-editor-icon').length).toBe(0);
    });
  });

  describe('Beautify', () => {
    it('confirm clicking beautify actually works within context of component', () => {

      const codeEditorEl = mount(
        <ReactComponents.CodeEditorPanel
          defaultCode={codeNoNewlines}
        />
      );

      // confirm there are no newlines in the code at this point
      expect(codeEditorEl.instance().getValue().match(/\n/g)).toBeNull();

      codeEditorEl.find('.beautify').simulate('click');

      // now confirm newlines are found
      expect(codeEditorEl.instance().getValue().match(/\n/g).length).toBe(2);
    });
  });

});
