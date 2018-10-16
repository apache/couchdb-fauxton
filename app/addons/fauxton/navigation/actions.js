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

import FauxtonAPI from '../../../core/api';
import ActionTypes from './actiontypes';

export const toggleNavbarMenu = () => (dispatch) => {
  dispatch({
    type: ActionTypes.TOGGLE_NAVBAR_MENU
  });
};

export const addHeaderLink = (link) => (dispatch) => {
  dispatch({
    type: ActionTypes.ADD_NAVBAR_LINK,
    link: link
  });
};

export const removeHeaderLink = (link) => (dispatch) => {
  dispatch({
    type: ActionTypes.REMOVE_NAVBAR_LINK,
    link: link
  });
};

export const setNavbarVersionInfo = (versionInfo) => {
  FauxtonAPI.reduxDispatch({
    type: ActionTypes.NAVBAR_SET_VERSION_INFO,
    version: versionInfo
  });
};

export const setNavbarActiveLink = (header) => (dispatch) => {
  dispatch({
    type: ActionTypes.NAVBAR_ACTIVE_LINK,
    name: header
  });
};

export const showNavBar = () => (dispatch) => {
  dispatch({
    type: ActionTypes.NAVBAR_SHOW
  });
};

export const hideNavBar = () => (dispatch) => {
  dispatch({
    type: ActionTypes.NAVBAR_HIDE
  });
};
