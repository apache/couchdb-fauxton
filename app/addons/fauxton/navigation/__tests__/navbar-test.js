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
import NavBarContainer from "../container/NavBar";
import FauxtonAPI from "../../../../core/api";
import ActionTypes from "../actiontypes";
import React from "react";
import ReactDOM from "react-dom";
import {mount} from 'enzyme';

describe('Navigation Bar', () => {
  FauxtonAPI.session = {
    user: () => {}
  };

  it('is displayed by default', () => {
    const NavBar = mount(<NavBarContainer />);
    expect(NavBar.find('.faux-navbar').length).toBe(1);
  });

  it('is dynamically displayed by isNavBarVisible', () => {
    const NavBar = mount(<NavBarContainer />);

    FauxtonAPI.dispatch({
      type: ActionTypes.NAVBAR_HIDE
    });
    expect(NavBar.find('.faux-navbar').length).toBe(0);

    FauxtonAPI.dispatch({
      type: ActionTypes.NAVBAR_SHOW
    });
    expect(NavBar.find('.faux-navbar').length).toBe(1);
  });

});
