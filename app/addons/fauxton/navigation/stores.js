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
import ActionTypes from "./actiontypes";
import {findIndex} from 'lodash';

const Stores = {};

Stores.NavBarStore = FauxtonAPI.Store.extend({
  initialize () {
    this.reset();
  },

  reset () {
    this._isMinimized = true;
    this._activeLink = null;
    this._version = null;
    this._navLinks = [];
    this._footerNavLinks = [];
    this._bottomNavLinks = [];
    this._navBarVisible = true;

    this._loginSectionVisible = false;
    this._loginVisibleInsteadOfLogout = true;
  },

  getIsLoginSectionVisible () {
    return this._loginSectionVisible;
  },

  getIsLoginVisibleInsteadOfLogout () {
    return this._loginVisibleInsteadOfLogout;
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

    const indexOf = findIndex(links, link => {
      if (link.id === removeLink.id) {
        return true;
      }

      return false;
    });

    if (indexOf === -1) { return; }

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
    this._isMinimized = !this._isMinimized;
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

  showLinkBadge (link) {
    const links = this.getLinkSection(link);
    const selectedLink = links.find(function (oldLink) {
      return oldLink.title === link.title;
    });
    if (selectedLink) {
      selectedLink.badge = true;
    }
  },

  hideLinkBadge (link) {
    const links = this.getLinkSection(link);
    const selectedLink = links.find(function (oldLink) {
      return oldLink.title === link.title;
    });

    if (selectedLink) {
      selectedLink.badge = false;
    }
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
    return this._isMinimized;
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

      case ActionTypes.SHOW_NAVBAR_LINK_BADGE:
        this.showLinkBadge(action.link);
        break;

      case ActionTypes.HIDE_NAVBAR_LINK_BADGE:
        this.hideLinkBadge(action.link);
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

      case ActionTypes.NAVBAR_SHOW_HIDE_LOGIN_LOGOUT_SECTION:
        this._loginSectionVisible = action.visible;
        break;

      case ActionTypes.NAVBAR_SHOW_LOGIN_BUTTON:
        this._loginSectionVisible = true;
        this._loginVisibleInsteadOfLogout = true;
        break;

      case ActionTypes.NAVBAR_SHOW_LOGOUT_BUTTON:
        this._loginSectionVisible = true;
        this._loginVisibleInsteadOfLogout = false;
        break;

      default:
        return;
      // do nothing
    }

    this.triggerChange();
  }
});

Stores.navBarStore = new Stores.NavBarStore();
Stores.navBarStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.navBarStore.dispatch.bind(Stores.navBarStore));

export default Stores;
