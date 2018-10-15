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


import React from 'react';
import { mount } from 'enzyme';
import NavBar from '../components/NavBar';

describe('Navigation Bar', () => {
  const defaultProps = {
    activeLink: '',
    isMinimized: false,
    version: '42',
    navLinks: [],
    bottomNavLinks: [],
    footerNavLinks: [],
    isNavBarVisible: true,
    isLoginSectionVisible: true,
    isLoginVisibleInsteadOfLogout: true,
    toggleNavbarMenu: () => {}
  };
  it('renders with login button when logged out', () => {
    const navBar = mount(<NavBar {...defaultProps} />);

    const button = navBar.find('[href="#/login"]');
    expect(button.text()).toContain('Login');
  });

  it('renders with logout button when logged in', () => {
    const props = {
      username: 'Rocko',
      isLoginVisibleInsteadOfLogout: false
    };

    const navBar = mount(<NavBar {...defaultProps} {...props} />);

    const button = navBar.find('[href="#/logout"]');
    expect(button.text()).toContain('Log Out');
  });

  it('Admin Party has no Logout button and no Login button', () => {
    const props = {
      username: 'Rocko',
      isLoginSectionVisible: false,
      isLoginVisibleInsteadOfLogout: false
    };

    const navBar = mount(<NavBar {...defaultProps} {...props} />);

    expect(navBar.text()).not.toMatch(/Login/);
    expect(navBar.text()).not.toMatch(/Log Out/);
  });

});
