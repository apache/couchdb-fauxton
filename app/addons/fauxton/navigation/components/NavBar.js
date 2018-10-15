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

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Footer from './Footer';
import Burger from './Burger';
import NavLink from './NavLink';
import Brand from './Brand';
import LogoutButton from './LogoutButton';
import LoginButton from './LoginButton';

class NavBar extends Component {

  constructor(props) {
    super(props);
  }

  createLinks (links) {
    const { activeLink, isMinimized } = this.props;

    return links.map((link, i) => {
      return <NavLink
        key={i}
        link={link}
        active={activeLink}
        isMinimized={isMinimized} />;
    });
  }

  render () {
    const {
      isMinimized,
      version,
      isLoginSectionVisible,
      isLoginVisibleInsteadOfLogout,
      activeLink,
      username,
      isNavBarVisible,
      toggleNavbarMenu
    } = this.props;

    if (!isNavBarVisible) {
      return null;
    }

    const navLinks = this.createLinks(this.props.navLinks);
    const bottomNavLinks = this.createLinks(this.props.bottomNavLinks);
    const footerNavLinks = this.createLinks(this.props.footerNavLinks);

    const navClasses = classNames(
      'faux-navbar',
      {'faux-navbar--wide':  !isMinimized},
      {'faux-navbar--narrow': isMinimized}
    );

    const loginSection = isLoginVisibleInsteadOfLogout ?
      <LoginButton active={activeLink} isMinimized={isMinimized} /> :
      <LogoutButton username={username} isMinimized={isMinimized} />;

    return (
      <div className={navClasses}>
        <nav>
          <div className="faux-navbar__linkcontainer">
            <Burger isMinimized={isMinimized} toggleMenu={toggleNavbarMenu}/>
            <div className="faux-navbar__links">
              {navLinks}
              {bottomNavLinks}
            </div>

            <div className="faux-navbar__footer">
              <Brand isMinimized={isMinimized} />

              <div>
                {footerNavLinks}
              </div>

              <Footer version={version}/>

              {isLoginSectionVisible ? loginSection : null}
            </div>
          </div>
        </nav>
      </div>
    );
  }
}

NavBar.propTypes = {
  activeLink: PropTypes.string,
  isMinimized: PropTypes.bool.isRequired,
  version: PropTypes.string,
  username: PropTypes.string,
  navLinks: PropTypes.array,
  bottomNavLinks: PropTypes.array,
  footerNavLinks: PropTypes.array,
  isNavBarVisible: PropTypes.bool,
  isLoginSectionVisible: PropTypes.bool.isRequired,
  isLoginVisibleInsteadOfLogout: PropTypes.bool.isRequired,
  toggleNavbarMenu: PropTypes.func.isRequired
};

export default NavBar;
