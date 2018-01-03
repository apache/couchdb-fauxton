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

import FauxtonAPI from "../../core/api";
import 'whatwg-fetch';
import { isValueAlreadySet, addValueToPermissions } from './helpers';


import {
  PERMISSIONS_UPDATE
} from './actiontypes';


export const receivedPermissions = json => {
  return {
    type: PERMISSIONS_UPDATE,
    permissions: json
  };
};

export const fetchPermissions = url => dispatch => {
  return fetch(url, {
    headers: {'Accept': 'application/json' },
    credentials: 'include'
  })
    .then((res) => res.json())
    .then(json => {
      if (json.error && json.reason) {
        dispatch(receivedPermissions(
          {admins:{roles:["_admin"]}, members:{roles:["_admin"]}}));
        throw new Error(json.reason);
      }
      dispatch(receivedPermissions(json));
    })
    .catch((err) => {
      FauxtonAPI.addNotification({
        msg: 'Failed to retrieve permissions. Please try again. Reason:'
         + err.message,
        type: 'error'
      });
    });
};

export const setPermissionOnObject = (p, section, type, value) => {
  if (isValueAlreadySet(p, section, type, value)) {
    throw new Error('Role/Name has already been added');
  }

  const res = addValueToPermissions(p, section, type, value);

  return res;
};

export const deletePermissionFromObject = (p, section, type, value) => {
  if (!isValueAlreadySet(p, section, type, value)) {
    throw new Error('Role/Name does not exist');
  }

  p[section][type] = p[section][type].filter((el) => {
    return el !== value;
  });

  return p;
};

export const updatePermission = (url, permissions, section, type, value) => dispatch => {
  setPermissionOnObject(permissions, section, type, value);

  updatePermissionUnsafe(url, permissions, dispatch)
    .catch((err) => {
      FauxtonAPI.addNotification({
        msg: err.message,
        type: 'error'
      });
    });
};

export const deletePermission = (url, permissions, section, type, value) => dispatch => {
  deletePermissionFromObject(permissions, section, type, value);

  updatePermissionUnsafe(url, permissions, dispatch)
    .catch((err) => {
      FauxtonAPI.addNotification({
        msg: err.message,
        type: 'error'
      });
    });
};

export const updatePermissionUnsafe = (url, p, dispatch) => {
  return fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    method: 'PUT',
    body: JSON.stringify(p)
  })
    .then((res) => res.json())
    .then((json) => {
      if (!json.ok) {
        throw new Error(json.reason);
      }
      return json;
    })
    .then(() => {
      FauxtonAPI.addNotification({
        msg: 'Database permissions has been updated.'
      });

      return dispatch(receivedPermissions(p));
    })
    .catch((error) => {
      FauxtonAPI.addNotification({
        msg: 'Could not update permissions - reason: ' + error,
        type: 'error'
      });
    });
};
