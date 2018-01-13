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

import {
  PERMISSIONS_UPDATE
} from './actiontypes';

const initialState = {
  isLoading: true,
  security: {},
  adminRoles: [],
  adminNames: [],
  memberNames: [],
  memberRoles: []
};

export default function permissions (state = initialState, action) {
  switch (action.type) {

    case PERMISSIONS_UPDATE:
      const { permissions } = action;
      return Object.assign({}, state, {
        isLoading: false,

        security: permissions,
        adminRoles: getRoles('admins', permissions),
        adminNames: getNames('admins', permissions),
        memberRoles: getRoles('members', permissions),
        memberNames: getNames('members', permissions)
      });

    default:
      return state;
  }
}

function getRoles (type, permissions) {
  if (!permissions[type]) {
    return [];
  }

  return permissions[type].roles ? permissions[type].roles : [];
}

function getNames (type, permissions) {
  if (!permissions[type]) {
    return [];
  }

  return permissions[type].names ? permissions[type].names : [];
}

export const getIsLoading = state => state.isLoading;
export const getSecurity = state => state.security;
export const getAdminRoles = state => state.adminRoles;
export const getAdminNames = state => state.adminNames;
export const getMemberNames = state => state.memberNames;
export const getMemberRoles = state => state.memberRoles;
