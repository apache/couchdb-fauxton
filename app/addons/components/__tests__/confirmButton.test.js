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

describe('ConfirmButton', function () {
  let button;

  it('should render text properties', function () {
    button = mount(
      <ReactComponents.ConfirmButton text="Click here to render Rocko Artischocko" />
    );
    expect(button.text()).toBe('Click here to render Rocko Artischocko');
  });

  it('should use onClick handler if provided', function () {
    const spy = sinon.spy();

    button = mount(
      <ReactComponents.ConfirmButton text="Click here" onClick={spy} />
    );

    button.simulate('click');
    expect(spy.calledOnce).toBeTruthy();
  });

  it('shows icon by default', function () {
    button = mount(
      <ReactComponents.ConfirmButton text="Click here" onClick={function () { }} />
    );
    expect(button.find('.icon').length).toBe(1);
  });

  it('optionally omits the icon', function () {
    button = mount(
      <ReactComponents.ConfirmButton text="Click here" onClick={function () { }} showIcon={false} />
    );
    expect(button.find('.icon').length).toBe(0);
  });
});
