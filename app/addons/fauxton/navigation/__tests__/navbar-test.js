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
    const navbar = mount(<NavBarContainer />);
    expect(navbar.find('.faux-navbar').length).toBe(1);
  });

  it('is dynamically displayed by isNavBarVisible', () => {
    const navbar = mount(<NavBarContainer />);

    FauxtonAPI.dispatch({
      type: ActionTypes.NAVBAR_HIDE
    });
    navbar.update();
    expect(navbar.find('.faux-navbar').length).toBe(0);

    FauxtonAPI.dispatch({
      type: ActionTypes.NAVBAR_SHOW
    });
    navbar.update();
    expect(navbar.find('.faux-navbar').length).toBe(1);
  });

  it('can display items with icon badge', () => {
    FauxtonAPI.dispatch({
      type: ActionTypes.ADD_NAVBAR_LINK,
      link: {
        href: "#/_with_badge",
        title: "WithBadge",
        icon: "fonticon-database",
        badge: true
      }
    });
    FauxtonAPI.dispatch({
      type: ActionTypes.ADD_NAVBAR_LINK,
      link: {
        href: "#/_without_badge",
        title: "WithoutBadge",
        icon: "fonticon-database"
      }
    });
    const navbar = mount(<NavBarContainer />);
    expect(navbar.find('div[data-nav-name="WithoutBadge"] i.faux-navbar__icon-badge').length, 0);
    expect(navbar.find('div[data-nav-name="WithBadge"] i.faux-navbar__icon-badge').length, 1);
  });

});
