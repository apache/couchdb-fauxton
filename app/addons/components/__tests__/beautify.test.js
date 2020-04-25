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

describe('Beautify', () => {
  let beautifyEl;

  it('should be empty for multi-lined code', () => {
    const correctCode = 'function() {\n    console.log("hello");\n}';
    beautifyEl = mount(
      <ReactComponents.Beautify code={correctCode}/>
    );
    expect(beautifyEl.instance().render()).toBeNull();
  });

  it('should have button to beautify for single line code', () => {
    const badCode = '() => { console.log("hello"); }';
    beautifyEl = mount(<ReactComponents.Beautify code={badCode}/>);
    expect(beautifyEl.find('button').hasClass('beautify')).toBeTruthy();
  });

  it('on click beautifies code', () => {
    let fixedCode;
    const correctCode = 'function() {\n    console.log("hello");\n}';

    const beautifiedCode = (code) => {
      fixedCode = code;
    };

    beautifyEl = mount(
      <ReactComponents.Beautify
        beautifiedCode={beautifiedCode}
        code={'function() { console.log("hello"); }'}
        noOfLines={1}/>
    );
    beautifyEl.simulate('click');
    expect(fixedCode).toBe(correctCode);
  });

  it('on click beautifies es6 code', () => {
    let fixedCode;
    const correctCode = '({\n    type,\n    code\n}) => type === \'WIDGET\' && emit(code, 1)';

    const beautifiedCode = (code) => {
      fixedCode = code;
    };

    beautifyEl = mount(
      <ReactComponents.Beautify
        beautifiedCode={beautifiedCode}
        code={'({type,code}) => type === \'WIDGET\' && emit(code,1)'}
        noOfLines={1}/>
    );
    beautifyEl.simulate('click');
    expect(fixedCode).toBe(correctCode);
  });
});
