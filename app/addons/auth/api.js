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
import { defaultsDeep } from "lodash";

export const json = (url, opts = {}) => fetch(
  url,
  defaultsDeep(
    {
      credentials: "include",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json"
      }
    },
    opts
  )
).then(resp => resp.json());

export const formEncoded = (url, opts = {}) => fetch(
  url,
  defaultsDeep(
    {
      credentials: "include",
      headers: {
        accept: "application/json",
        "Content-Type": 'application/x-www-form-urlencoded;charset=UTF-8'
      }
    },
    opts
  )
).then(resp => resp.json());


export function createAdmin({name, password, node}) {
  return json(`${app.host}/_node/${node}/_config/admins/${name}`, {
    method: "PUT",
    body: JSON.stringify(password)
  });
}

let loggedInSessionPromise;

export function getSession() {
  if (loggedInSessionPromise) {
    return loggedInSessionPromise;
  }

  const promise = json(app.host + "/_session").then(resp => {
    if (resp.userCtx.name) {
      loggedInSessionPromise = promise;
    }
    return resp.userCtx;
  });

  return promise;
}

export function login(body) {
  return formEncoded(app.host + "/_session", {
    method: "POST",
    body: $.param(body)
  });
}

export function logout() {
  loggedInSessionPromise = null;
  return formEncoded(app.host + "/_session", {
    method: "DELETE",
    body: $.param({ username: "_", password: "_" })
  });
}

export default {
  createAdmin,
  login,
  logout,
  getSession
};
