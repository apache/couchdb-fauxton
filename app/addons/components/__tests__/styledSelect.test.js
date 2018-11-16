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

describe('styled select', () => {
  let selectorEl, spy = sinon.spy();

  beforeEach(() => {
    const selectContent = (
      <optgroup label="Select a document">
        <option value="new">New Design Document</option>
        <option value="foo">New Design Document</option>
      </optgroup>
    );

    selectorEl = mount(
      <ReactComponents.StyledSelect
        selectValue={"foo"}
        selectId="new-ddoc"
        selectClass=""
        selectContent={selectContent}
        selectChange={spy} />
    );
  });

  it('calls the callback on select', () => {
    selectorEl.find('#new-ddoc').simulate('change', {
      target: {
        value: 'new'
      }
    });
    expect(spy.calledOnce).toBeTruthy();
  });

});
