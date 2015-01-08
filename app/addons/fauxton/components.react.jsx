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
    getStoreState: function () {
      return {
        version: navBarStore.getVersion()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    componentDidMount: function () {
      navBarStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function() {
      navBarStore.off('change', this.onChange);
    },

    render: function () {
      var version = this.state.version;

      if (!version) { return null; }
      return (
        <div className="version-footer">
          Fauxton on 
          <a href="http://couchdb.apache.org/">Apache CouchDB</a>
          <br/> 
          v. {version}
        </div>
      );
    }
  });

  var Burger = React.createClass({
    render: function () {
      return (
        <div className="burger" onClick={this.toggleMenu}>
          <div></div>
          <div></div>
          <div></div>
        </div>
      );
    },

    toggleMenu: function () {
      Actions.toggleNavbarMenu();
    }
  });

  var NavLink = React.createClass({
    render: function () {
      var link = this.props.link;
      var liClassName = this.props.active === link.title ? 'active' : '';

      return (
        <li data-nav-name={link.title} className={liClassName} >
          <a href={link.href}>
            <i className={link.icon + " fonticon "}></i>
            {link.title}
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
        activeLink: navBarStore.getActiveLink()
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

    componentDidMount: function () {
      navBarStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function() {
      navBarStore.off('change', this.onChange);
    },

    render: function () {
      var navLinks = this.createLinks(this.state.navLinks);
      var bottomNavLinks = this.createLinks(this.state.bottomNavLinks);
      var footerNavLinks = this.createLinks(this.state.footerNavLinks);

      return (
        <div className="navbar">
          <Burger />
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

          <div className="bottom-container">
            <div className="brand">
              <div className="icon">Apache Fauxton</div>
            </div>
            <Footer />
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
