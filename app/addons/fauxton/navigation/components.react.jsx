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
import app from "../../../app";
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

const NavLink = React.createClass({
  render () {
    const link = this.props.link;
    const liClassName = this.props.active === link.title ? 'active' : '';

    return (
      <li data-nav-name={link.title} className={liClassName} >
        <a href={link.href} target={link.target ? '_blank' : null} data-bypass={link.target ? 'true' : null}>
          <i className={link.icon + " fonticon "}></i>
          <span dangerouslySetInnerHTML={{__html: link.title }} />
        </a>
      </li>
    );
  }
});

const NavBar = React.createClass({
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
      <div className="navbar">
        <Burger toggleMenu={this.toggleMenu}/>
        <nav id="main_navigation">
          <ul id="nav-links" className="nav">
            {navLinks}
          </ul>

          <div id="bottom-nav">
            <ul id="bottom-nav-links" className="nav">
              {bottomNavLinks}
            </ul>
          </div>
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
  renderNavBar (el) {
    ReactDOM.render(<NavBar/>, el);
  },
  NavBar: NavBar,
  Burger: Burger
};
