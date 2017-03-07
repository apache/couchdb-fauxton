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
import FauxtonAPI from "../../../core/api";
import React from "react";
import ReactDOM from "react-dom";
import Stores from "./stores";
import Actions from "./actions";
const navBarStore = Stores.navBarStore;

const Footer = React.createClass({
  render () {
    const version = this.props.version;

    if (!version) { return null; }
    return (
      <div className="version-footer">
        Fauxton on {" "}
        <a href="http://couchdb.apache.org/">Apache CouchDB</a>
        {" "} v. {version}
      </div>
    );
  }
});

const Burger = React.createClass({
  render () {
    return (
      <div className="burger" onClick={this.props.toggleMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  }
});

const NavLink = ({link, active}) => {

  const divClassName = active === link.title ? 'faux-navbar__link--active' : 'faux-navbar__link--inactive';

  return (

    <a className={"faux-navbar__link " + divClassName} href={link.href} target={link.target ? '_blank' : null} data-bypass={link.target ? 'true' : null}>
      <div data-nav-name={link.title} className="faux-navbar__itemarea">
        <i className={link.icon + " fonticon faux-navbar__icon"}></i>
        <span className="faux-navbar__text" dangerouslySetInnerHTML={{__html: link.title}} />
      </div>
    </a>

  );

};

export const NavBar = React.createClass({
  getStoreState () {
    return {
      navLinks: navBarStore.getNavLinks(),
      bottomNavLinks: navBarStore.getBottomNavLinks(),
      footerNavLinks: navBarStore.getFooterNavLinks(),
      activeLink: navBarStore.getActiveLink(),
      version: navBarStore.getVersion(),
      isMinimized: navBarStore.isMinimized(),
      isNavBarVisible: navBarStore.isNavBarVisible()
    };
  },

  getInitialState () {
    return this.getStoreState();
  },

  createLinks (links) {
    return _.map(links, function (link, i) {
      return <NavLink key={i} link={link} active={this.state.activeLink} />;
    }, this);
  },

  onChange () {
    this.setState(this.getStoreState());
  },

  setMenuState () {
    $('body').toggleClass('closeMenu', this.state.isMinimized);
    FauxtonAPI.Events.trigger(FauxtonAPI.constants.EVENTS.NAVBAR_SIZE_CHANGED, this.state.isMinimized);
  },

  componentDidMount () {
    navBarStore.on('change', this.onChange, this);
    this.setMenuState();
  },

  componentDidUpdate () {
    this.setMenuState();
  },

  componentWillUnmount () {
    navBarStore.off('change', this.onChange);
  },

  toggleMenu () {
    Actions.toggleNavbarMenu();
  },

  render () {
    //YUCK!! but we can only really fix this once we have removed all backbone
    if (!this.state.isNavBarVisible) {
      $('#primary-navbar').hide();
      return null;
    }

    $('#primary-navbar').show();

    const navLinks = this.createLinks(this.state.navLinks);
    const bottomNavLinks = this.createLinks(this.state.bottomNavLinks);
    const footerNavLinks = this.createLinks(this.state.footerNavLinks);

    return (
      <div className="faux-navbar">
        <Burger toggleMenu={this.toggleMenu}/>
        <nav>

          {navLinks}
          {bottomNavLinks}

        </nav>

        <div id="primary-nav-right-shadow"/>

        <div className="bottom-container">
          <div className="brand">
            <div className="icon">Apache Fauxton</div>
          </div>

          <Footer version={this.state.version}/>
          <div id="footer-links">
            <ul id="footer-nav-links" className="nav">
              {footerNavLinks}
            </ul>
          </div>
        </div>
      </div>
    );
  }
});

export default {
  NavBar: NavBar,
  Burger: Burger
};
