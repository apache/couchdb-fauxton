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

import {get, put} from '../../core/ajax';
import Helpers from '../../helpers';
import Constants from './constants';
import {getUserDocId} from './helpers';

const userDocUrl = (name) => {
  return Helpers.getServerUrl('/' + Constants.USERS_DB + '/' + encodeURIComponent(getUserDocId(name)));
};

// Resolves to true when the user doc exists, false when it does not.
// Any other status (e.g. a non-admin not allowed to read other user docs)
// resolves to null, meaning uniqueness could not be verified; the server
// will still reject a duplicate on save with a conflict.
export const checkUserExists = (name) => {
  return get(userDocUrl(name), {raw: true}).then(resp => {
    if (resp.status === 200) {
      return true;
    }
    if (resp.status === 404) {
      return false;
    }
    return null;
  });
};

export const createUser = (userDoc) => {
  return put(userDocUrl(userDoc.name), userDoc).then(json => {
    if (json.error) {
      const err = new Error(json.reason || json.error);
      err.error = json.error;
      throw err;
    }
    return json;
  });
};
