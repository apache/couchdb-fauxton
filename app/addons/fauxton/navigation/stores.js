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
  'addons/fauxton/navigation/actiontypes'
],

function (app, FauxtonAPI, ActionTypes) {
  var Stores = {};

  var csrfItem = {
    id: 'csrf',
    title: 'CSRF',
    icon: 'icon-shield',
    statusArea: true
  };

  Stores.NavBarStore = FauxtonAPI.Store.extend({
    initialize: function () {
      this.reset();
    },

    reset: function () {
      this.activeLink = null;
      this.version = null;
      this.navLinks = [];
      this.footerNavLinks = [];
      this.statusArea = [csrfItem];
      this.bottomNavLinks = [{
        id: 'Documentation',
        title: "Documentation",
        icon: "fonticon-bookmark",
        href: app.helpers.getDocUrl('GENERAL'),
        bottomNav: true,
        top: true,
        target: '_blank'
      }];
    },

    addCsrfInfo: function () {
      this.addLink(csrfItem);
    },

    addLink: function (link) {
      if (link.top && !link.bottomNav) {
        this.navLinks.unshift(link);
        return;
      }
      if (link.top && link.bottomNav) {
        this.bottomNavLinks.unshift(link);
        return;
      }
      if (link.bottomNav) {
        this.bottomNavLinks.push(link);
        return;
      }
      if (link.footerNav) {
        this.footerNavLinks.push(link);
        return;
      }
      if (link.statusArea) {
        this.statusArea.push(link);
        return;
      }

      this.navLinks.push(link);
    },

    removeLink: function (removeLink) {
      var links = this.getLinkSection(removeLink);
      var indexOf = 0;

      var res = _.filter(links, function (link) {
        if (link.id === removeLink.id) {
          return true;
        }

        indexOf++;
        return false;
      });

      if (!res.length) { return; }

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

    getStatusAreaItems: function () {
      return this.statusArea;
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

      if (link.statusArea) {
        links = this.statusArea;
      }

      return links;
    },

    updateLink: function (link) {
      var oldLink;
      var links = this.getLinkSection(link);

      oldLink = _.find(links, function (oldLink) {
        return oldLink.id === link.id;
      });

      if (!oldLink) { return; }

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
      switch (action.type) {

        case ActionTypes.ADD_NAVBAR_LINK:
          this.addLink(action.link);
        break;
        case ActionTypes.TOGGLE_NAVBAR_MENU:
          this.toggleMenu();
        break;
        case ActionTypes.UPDATE_NAVBAR_LINK:
          this.updateLink(action.link);
        break;

        case ActionTypes.CLEAR_NAVBAR_LINK:
          this.reset();
        break;

        case ActionTypes.REMOVE_NAVBAR_LINK:
          this.removeLink(action.link);
        break;

        case ActionTypes.NAVBAR_SET_VERSION_INFO:
          this.setVersion(action.version);
        break;

        case ActionTypes.SHOW_CSRF_INFO:
          this.addCsrfInfo();
        break;

        case ActionTypes.NAVBAR_ACTIVE_LINK:
          this.setActiveLink(action.name);
        break;

        default:
        return;
        // do nothing
      }

      this.triggerChange();
    }
  });

  Stores.navBarStore = new Stores.NavBarStore();
  Stores.navBarStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.navBarStore.dispatch);

  return Stores;
});

