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

describe('Zen Mode', () => {
  let el, spy;

  beforeEach(() => {
    spy = sinon.spy();

    el = mount(
      <ReactComponents.ZenModeOverlay defaultCode={code} onExit={spy} />
    );
  });

  afterEach(() => {
    window.localStorage.removeItem('zenTheme');
  });

  describe('Toggle theme', () => {
    it('defaults to dark theme', () => {
      expect(el.find('div.zen-theme-dark').exists()).toBeTruthy();
    });

    it('switch to light theme on click', () => {
      el.find('.js-toggle-theme').simulate('click');
      expect(el.find('div.zen-theme-light').exists()).toBeTruthy();
      // reset
      el.find('.js-toggle-theme').simulate('click');
    });
  });

  describe('Closing zen mode', () => {
    it('method called', () => {
      el.find('.js-exit-zen-mode').simulate('click');
      expect(spy.calledOnce).toBeTruthy();
    });
  });

});
