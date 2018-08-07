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

import app from './../../app';
import Helpers from "../../helpers";
import {deleteFormEncoded, get, postFormEncoded, put} from '../../core/ajax';


export function createAdmin({name, password, node}) {
  const url = Helpers.getServerUrl(`/_node/${node}/_config/admins/${name}`);
  return put(url, password);
}

let loggedInSessionPromise;

export function getSession() {
  if (loggedInSessionPromise) {
    return loggedInSessionPromise;
  }

  const url = Helpers.getServerUrl('/_session');
  const promise = get(url).then(resp => {
    if (resp.userCtx.name) {
      loggedInSessionPromise = promise;
    }
    return resp.userCtx;
  });

  return promise;
}

export function login(body) {
  const url = Helpers.getServerUrl('/_session');
  return postFormEncoded(url, app.utils.queryParams(body));
}

export function logout() {
  loggedInSessionPromise = null;
  const url = Helpers.getServerUrl('/_session');
  return deleteFormEncoded(url, app.utils.queryParams({ username: "_", password: "_" }));
}

export default {
  createAdmin,
  login,
  logout,
  getSession
};
