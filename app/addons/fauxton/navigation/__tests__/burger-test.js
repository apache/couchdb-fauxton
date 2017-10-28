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
import Burger from "../components/Burger";
import React from "react";
import ReactDOM from "react-dom";
import sinon from "sinon";
import {mount} from 'enzyme';

describe('Navigation Bar', () => {

  describe('Burger', () => {
    it('dispatch TOGGLE_NAVBAR_MENU on click', () => {
      const toggleMenu = sinon.spy();
      const burgerEl = mount(<Burger toggleMenu={toggleMenu} isMinimized={false} />);
      burgerEl.simulate('click');
      expect(toggleMenu.calledOnce).toBeTruthy();
    });

  });
});
