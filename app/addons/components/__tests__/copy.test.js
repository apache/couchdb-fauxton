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
import { Copy } from "../components/copy";
import { mount } from "enzyme";
import React from "react";
import { v4 as uuidv4 } from 'uuid';

describe('Copy', () => {

  it('shows a copy icon by default', () => {
    const wrapper = mount(<Copy uniqueKey={uuidv4()} text="copy me"/>);
    expect(wrapper.find('.icon-paste').length).toBe(1);
  });

  it('shows text if specified', () => {
    const wrapper = mount(<Copy uniqueKey={uuidv4()} text="copy me" displayType="text" />);
    expect(wrapper.find('.icon-paste').length).toBe(0);
  });

  it('shows custom text if specified', () => {
    const wrapper = mount(<Copy uniqueKey={uuidv4()} displayType="text" textDisplay="booyah!" text="copy me" />);
    expect(wrapper.html()).toMatch(/booyah!/);
  });

  it('shows an input field and button if specified', () => {
    const wrapper = mount(<Copy uniqueKey={uuidv4()} displayType='input' text="http://localhost:8000/_all_dbs" />);
    expect(wrapper.find('input').length).toBe(1);
  });
});
