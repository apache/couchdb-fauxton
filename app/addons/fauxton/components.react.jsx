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

define([
  "api",
  "react",
  "addons/fauxton/stores",
  "addons/fauxton/actions"
],

function(FauxtonAPI, React, Stores, Actions) {
  var navBarStore = Stores.navBarStore;

  var Footer = React.createClass({
    render: function () {
      var version = this.props.version;

      if (!version) { return null; }
      return (
        <div className="version-footer">
          Fauxton on 
          <a href="http://couchdb.apache.org/"> Apache CouchDB</a>
          <br/> 
          v. {version}
        </div>
      );
    }
  });

  var Burger = React.createClass({
    render: function () {
      return (
        <div className="burger" onClick={this.props.toggleMenu}>
          <div></div>
          <div></div>
          <div></div>
        </div>
      );
    }
  });

  var NavLink = React.createClass({
    render: function () {
      var link = this.props.link;
      var liClassName = this.props.active === link.title ? 'active' : '';

      return (
        <li data-nav-name={link.title} className={liClassName} >
          <a href={link.href} target={link.target ? '_blank' : ''} data-bypass={link.target ? 'true' : 'false'}>
            <i className={link.icon + " fonticon "}></i>
            <span dangerouslySetInnerHTML={{__html: link.title }} /> 
          </a>
        </li>
      );
    }
  });

  var NavBar = React.createClass({
    getStoreState: function () {
      return {
        navLinks: navBarStore.getNavLinks(),
        bottomNavLinks: navBarStore.getBottomNavLinks(),
        footerNavLinks: navBarStore.getFooterNavLinks(),
        activeLink: navBarStore.getActiveLink(),
        version: navBarStore.getVersion(),
        isMinimized: navBarStore.isMinimized()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    createLinks: function (links) {
      return _.map(links, function (link, i) {
        return <NavLink key={i} link={link} active={this.state.activeLink} />;
      }, this);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    setMenuState: function () {
      $('body').toggleClass('closeMenu', this.state.isMinimized);
    },

    componentDidMount: function () {
      navBarStore.on('change', this.onChange, this);
      this.setMenuState();
    },

    componentDidUpdate: function () {
      this.setMenuState();
    },

    componentWillUnmount: function() {
      navBarStore.off('change', this.onChange);
    },

    toggleMenu: function () {
      Actions.toggleNavbarMenu();
    },

    render: function () {
      var navLinks = this.createLinks(this.state.navLinks);
      var bottomNavLinks = this.createLinks(this.state.bottomNavLinks);
      var footerNavLinks = this.createLinks(this.state.footerNavLinks);

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


  return {
    renderNavBar: function (el) {
      React.render(<NavBar/>, el);
    },

    Burger: Burger
  };

});
