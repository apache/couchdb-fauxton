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

import ActionTypes from './actiontypes';

const initialState = {
  isMinimized: true,
  activeLink: null,
  version: null,
  navLinks: [],
  footerNavLinks: [],
  bottomNavLinks: [],
  navBarVisible: true,
  loginSectionVisible: false,
  loginVisibleInsteadOfLogout: true
};

function addLink(state, link) {
  const newState = { ...state };

  if (link.top && !link.bottomNav) {
    newState.navLinks = [].concat(newState.navLinks);
    newState.navLinks.unshift(link);
    return newState;
  }
  if (link.top && link.bottomNav) {
    newState.bottomNavLinks = [].concat(newState.bottomNavLinks);
    newState.bottomNavLinks.unshift(link);
    return newState;
  }
  if (link.bottomNav) {
    newState.bottomNavLinks = [].concat(newState.bottomNavLinks);
    newState.bottomNavLinks.push(link);
    return newState;
  }
  if (link.footerNav) {
    newState.footerNavLinks = [].concat(newState.footerNavLinks);
    newState.footerNavLinks.push(link);
    return newState;
  }

  newState.navLinks = [].concat(newState.navLinks);
  newState.navLinks.push(link);
  return newState;
}

function removeLink (state, removeLink) {
  const {links, sectionName} = getLinkSection(state, removeLink);

  // create new array without the link to remove
  const newLinks = links.filter(link => link.id !== removeLink.id);

  if (newLinks.length === links.length) {
    return state;
  }

  const newState = { ...state };
  newState[sectionName] = newLinks;
  return newState;
}

function updateLink (state, link) {
  const {links, sectionName} = getLinkSection(state, link);

  // create new array and updates the link when found
  let found = false;
  const newLinks = links.map(el => {
    if (el.id === link.id) {
      found = true;
      return {
        ...el,
        title: link.title,
        href: link.href
      };
    }
    return el;
  });

  if (!found) {
    return state;
  }

  const newState = { ...state };
  newState[sectionName] = newLinks;
  return newState;
}

function setLinkBadgeVisible (state, link, visible) {
  const {links, sectionName} = getLinkSection(state, link);

  let found = false;
  const newLinks = links.map(el => {
    if (el.title === link.title) {
      found = true;
      return {
        ...el,
        badge: visible
      };
    }
    return el;
  });

  if (!found) {
    return state;
  }

  const newState = { ...state };
  newState[sectionName] = newLinks;
  return newState;
}

function getLinkSection (state, link) {
  let links = state.navLinks;
  let sectionName = 'navLinks';

  if (link.bottomNav) {
    links = state.bottomNavLinks;
    sectionName = 'bottomNavLinks';
  }

  if (link.footerNav) {
    links = state.footerNavLinks;
    sectionName = 'footerNavLinks';
  }

  return { links, sectionName };
}

export default function navigation(state = initialState, action) {
  switch (action.type) {

    case ActionTypes.ADD_NAVBAR_LINK:
      return addLink(state, action.link);

    case ActionTypes.TOGGLE_NAVBAR_MENU:
      return {
        ...state,
        isMinimized: !state.isMinimized
      };

    case ActionTypes.UPDATE_NAVBAR_LINK:
      return updateLink(state, action.link);

    case ActionTypes.REMOVE_NAVBAR_LINK:
      return removeLink(state, action.link);

    case ActionTypes.SHOW_NAVBAR_LINK_BADGE:
      return setLinkBadgeVisible(state, action.link, true);

    case ActionTypes.HIDE_NAVBAR_LINK_BADGE:
      return setLinkBadgeVisible(state, action.link, false);

    case ActionTypes.NAVBAR_SET_VERSION_INFO:
      return {
        ...state,
        version: action.version
      };

    case ActionTypes.NAVBAR_ACTIVE_LINK:
      return {
        ...state,
        activeLink: action.name
      };

    case ActionTypes.NAVBAR_HIDE:
      return {
        ...state,
        navBarVisible: false
      };

    case ActionTypes.NAVBAR_SHOW:
      return {
        ...state,
        navBarVisible: true
      };

    case ActionTypes.NAVBAR_SHOW_HIDE_LOGIN_LOGOUT_SECTION:
      return {
        ...state,
        loginSectionVisible: action.visible
      };

    case ActionTypes.NAVBAR_SHOW_LOGIN_BUTTON:
      return {
        ...state,
        loginSectionVisible: true,
        loginVisibleInsteadOfLogout: true
      };

    case ActionTypes.NAVBAR_SHOW_LOGOUT_BUTTON:
      return {
        ...state,
        loginSectionVisible: true,
        loginVisibleInsteadOfLogout: false
      };

    default:
      return state;
  }
}
