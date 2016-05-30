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
import ActionTypes from "./actiontypes";
const Stores = {};


Stores.NavBarStore = FauxtonAPI.Store.extend({
  initialize () {
    this.reset();
  },

  reset () {
    this._activeLink = null;
    this._version = null;
    this._navLinks = [];
    this._footerNavLinks = [];
    this._bottomNavLinks = [];
    this._navBarVisible = true;
  },

  isNavBarVisible () {
    return this._navBarVisible;
  },

  showNavBar () {
    this._navBarVisible = true;
  },

  hideNavBar () {
    this._navBarVisible = false;
  },

  addLink (link) {
    if (link.top && !link.bottomNav) {
      this._navLinks.unshift(link);
      return;
    }
    if (link.top && link.bottomNav) {
      this._bottomNavLinks.unshift(link);
      return;
    }
    if (link.bottomNav) {
      this._bottomNavLinks.push(link);
      return;
    }
    if (link.footerNav) {
      this._footerNavLinks.push(link);
      return;
    }

    this._navLinks.push(link);
  },

  removeLink (removeLink) {
    const links = this.getLinkSection(removeLink);
    let indexOf = 0;

    const res = _.filter(links, function (link) {
      if (link.id === removeLink.id) {
        return true;
      }

      indexOf++;
      return false;
    });

    if (!res.length) { return; }

    links.splice(indexOf, 1);
  },

  getNavLinks () {
    return this._navLinks;
  },

  getBottomNavLinks () {
    return this._bottomNavLinks;
  },

  getFooterNavLinks () {
    return this._footerNavLinks;
  },

  toggleMenu () {
    app.utils.localStorageSet(FauxtonAPI.constants.LOCAL_STORAGE.SIDEBAR_MINIMIZED,
                              !this.isMinimized());
  },

  getLinkSection (link) {
    let links = this._navLinks;

    if (link.bottomNav) {
      links = this._bottomNavLinks;
    }

    if (link.footerNav) {
      links = this._footerNavLinks;
    }

    return links;
  },

  updateLink (link) {
    let oldLink;
    const links = this.getLinkSection(link);

    oldLink = _.find(links, function (oldLink) {
      return oldLink.id === link.id;
    });

    if (!oldLink) { return; }

    oldLink.title = link.title;
    oldLink.href = link.href;
  },

  getVersion () {
    return this._version;
  },

  setVersion (version) {
    this._version = version;
  },

  getActiveLink () {
    return this._activeLink;
  },

  setActiveLink (activeLink) {
    this._activeLink = activeLink;
  },

  isMinimized () {
    const isMinimized = app.utils.localStorageGet(FauxtonAPI.constants.LOCAL_STORAGE.SIDEBAR_MINIMIZED);
    return (_.isUndefined(isMinimized)) ? false : isMinimized;
  },

  dispatch (action) {
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

      case ActionTypes.NAVBAR_ACTIVE_LINK:
        this.setActiveLink(action.name);
      break;

      case ActionTypes.NAVBAR_HIDE:
        this.hideNavBar();
      break;

      case ActionTypes.NAVBAR_SHOW:
        this.showNavBar();
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

export default Stores;
