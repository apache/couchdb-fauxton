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

import {mount} from 'enzyme';
import React from 'react';
import NavBar from '../components/NavBar';

describe('Navigation Bar', () => {
  const defaultProps = {
    isMinimized: true,
    version: '',
    username: '',
    navLinks: [],
    bottomNavLinks: [],
    footerNavLinks: [],
    isNavBarVisible: true,
    isLoginSectionVisible: false,
    isLoginVisibleInsteadOfLogout: true,
    toggleNavbarMenu: () => {}
  };

  it('is displayed by default', () => {
    const navbar = mount(<NavBar {...defaultProps}/>);
    expect(navbar.find('.faux-navbar').length).toBe(1);
  });

  it('is dynamically displayed by isNavBarVisible', () => {
    const navbar = mount(<NavBar
      {...defaultProps}
      isNavBarVisible={false}/>);

    expect(navbar.find('.faux-navbar').length).toBe(0);

    navbar.setProps({ isNavBarVisible: true });
    navbar.update();
    expect(navbar.find('.faux-navbar').length).toBe(1);
  });

  it('can display items with icon badge', () => {
    const navLinks = [
      {
        href: "#/_with_badge",
        title: "WithBadge",
        icon: "fonticon-database",
        badge: true
      },
      {
        href: "#/_without_badge",
        title: "WithoutBadge",
        icon: "fonticon-database"
      }
    ];

    const navbar = mount(<NavBar
      {...defaultProps}
      navLinks={navLinks}/>);
    expect(navbar.find('div[data-nav-name="WithoutBadge"] i.faux-navbar__icon-badge').length).toBe(0);
    expect(navbar.find('div[data-nav-name="WithBadge"] i.faux-navbar__icon-badge').length).toBe(1);
  });

});
