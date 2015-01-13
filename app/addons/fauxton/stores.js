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
  'app',
  'api',
  'addons/fauxton/actiontypes'
],

function(app, FauxtonAPI, ActionTypes) {
  var Stores = {};

  Stores.NavBarStore = FauxtonAPI.Store.extend({
    initialize: function () {
      this.reset();
    },

    reset: function () {
      this.activeLink = null;
      this.version = null;
      this.navLinks = [];
      this.footerNavLinks = [];
      this.bottomNavLinks = [{
        title: "Documentation", 
        icon: "fonticon-bookmark",
        href: "#/activetasks",
        bottomNav: true,
        top: true
      }];
    },

    addLink: function (link) {
      if (link.top && !link.bottomNav){
        this.navLinks.unshift(link);
      } else if (link.top && link.bottomNav){
        this.bottomNavLinks.unshift(link);
      } else if (link.bottomNav) {
        this.bottomNavLinks.push(link);
      } else if (link.footerNav) {
        this.footerNavLinks.push(link);
      } else {
        this.navLinks.push(link);
      }
    },

    removeLink: function (removeLink) {
      var links = this.getLinkSection(removeLink);
      var indexOf = 0;

      var res = _.first(links, function (link) {
        if (link.id === removeLink.id) {
          return true;
        }

        indexOf++;
        return false;
      });

      if (!res) { return; }

      links.splice(indexOf, 1);
    },

    getNavLinks: function () {
      return this.navLinks;
    },

    getBottomNavLinks: function () {
      return this.bottomNavLinks;
    },

    getFooterNavLinks: function () {
      return this.footerNavLinks;
    },

    toggleMenu: function () {
      app.utils.localStorageSet(FauxtonAPI.constants.LOCAL_STORAGE.SIDEBAR_MINIMIZED, 
                                !this.isMinimized());
    },

    getLinkSection: function (link) {
      var links = this.navLinks;

      if (link.bottomNav) {
        links = this.bottomNavLinks;
      }

      if (link.footerNav) {
        links = this.footerNavLinks;
      }

      return links;
    },

    updateLink: function (link) {
      var oldLink;
      var links = this.getLinkSection(link);

      oldLink = _.find(links, function (oldLink) {
        return oldLink.id === link.id;
      });

      if(!oldLink) { return; }

      oldLink.title = link.title;
      oldLink.href = link.href;
    },

    getVersion: function () {
      return this.version;
    },

    setVersion: function (version) {
      this.version = version;
    },

    getActiveLink: function () {
      return this.activeLink;
    },

    setActiveLink: function (activeLink) {
      this.activeLink = activeLink;
    },

    isMinimized: function () {
      var isMinimized = app.utils.localStorageGet(FauxtonAPI.constants.LOCAL_STORAGE.SIDEBAR_MINIMIZED);
      return (_.isUndefined(isMinimized)) ? false : isMinimized;
    },

    dispatch: function (action) {
      switch(action.type) {

        case ActionTypes.ADD_NAVBAR_LINK:
          this.addLink(action.link);
          this.triggerChange();
        break;
        case ActionTypes.TOGGLE_NAVBAR_MENU:
          this.toggleMenu();
          this.triggerChange();
        break;
        case ActionTypes.UPDATE_NAVBAR_LINK:
          this.updateLink(action.link);
          this.triggerChange();
        break;

        case ActionTypes.CLEAR_NAVBAR_LINK:
          this.reset();
          this.triggerChange();
        break;

        case ActionTypes.REMOVE_NAVBAR_LINK:
          this.removeLink(action.link);
          this.triggerChange();
        break;

        case ActionTypes.NAVBAR_SET_VERSION_INFO:
          this.setVersion(action.version);
          this.triggerChange();
        break;

        case ActionTypes.NAVBAR_ACTIVE_LINK:
          this.setActiveLink(action.name);
          this.triggerChange();
        break;

        default:
          return;
        // do nothing
      }

    }
  });

  Stores.navBarStore = new Stores.NavBarStore();
  Stores.navBarStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.navBarStore.dispatch);

  return Stores;
});

