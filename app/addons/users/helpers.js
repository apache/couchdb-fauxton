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

import Constants from './constants';

// The validators below mirror the checks in the _users database's
// _design/_auth validate_doc_update function, so the user gets feedback
// before the request is sent. Each returns an error message or null.

export const getUserDocId = (name) => {
  return Constants.USER_ID_PREFIX + name;
};

export const getNewUserUrl = () => {
  return '/database/' + Constants.USERS_DB + '/_new_user';
};

export const validateUsername = (name) => {
  if (!name) {
    return 'Username is required.';
  }
  if (name[0] === '_') {
    return 'Username may not start with an underscore.';
  }
  const badChar = Constants.BAD_USERNAME_CHARS.find(c => name.indexOf(c) >= 0);
  if (badChar) {
    return `Character "${badChar}" is not allowed in usernames.`;
  }
  return null;
};

export const validateRole = (role, existingRoles = []) => {
  if (!role) {
    return 'Role cannot be empty.';
  }
  if (role[0] === '_' && !Constants.ALLOWED_SYSTEM_ROLES.includes(role)) {
    return 'System roles (starting with an underscore) are not allowed.';
  }
  if (existingRoles.includes(role)) {
    return `Role "${role}" has already been added.`;
  }
  return null;
};

export const validatePassword = (password, passwordConfirm) => {
  if (!password) {
    return 'Password is required.';
  }
  if (password !== passwordConfirm) {
    return 'Passwords do not match.';
  }
  return null;
};

export const buildUserDoc = ({name, password, roles}) => {
  return {
    _id: getUserDocId(name),
    name,
    password,
    type: Constants.USER_DOC_TYPE,
    roles: [...roles]
  };
};
