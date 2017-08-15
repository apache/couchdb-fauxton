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

import 'whatwg-fetch';
import app from "../../../app";
import FauxtonAPI from "../../../core/api";

export const fetchQueryExplain = (databaseName, queryCode) => {
  const url = FauxtonAPI.urls('mango', 'explain-server', databaseName);

  return fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8'
    },
    credentials: 'include',
    method: 'POST',
    body: queryCode
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.error) {
        throw new Error('(' + json.error + ') ' + json.reason);
      }
      return json;
    });
};

export const createIndex = (databaseName, indexCode) => {
  const url = FauxtonAPI.urls('mango', 'index-server',
    app.utils.safeURLName(databaseName));

  return fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8'
    },
    credentials: 'include',
    method: 'POST',
    body: indexCode
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.error) {
        throw new Error('(' + json.error + ') ' + json.reason);
      }
      return json;
    });
};
