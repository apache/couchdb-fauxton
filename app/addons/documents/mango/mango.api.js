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
import FauxtonAPI from "../../../core/api";

const defaultPageSize = FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE;

export const fetchIndexList = (databaseName, limit = defaultPageSize) => {

  const url = FauxtonAPI.urls('mango', 'index-server', encodeURIComponent(databaseName))
    + '?limit=' + encodeURIComponent(limit);
  return fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    method: 'GET'
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.error) {
        throw new Error('(' + json.error + ') ' + json.reason);
      }
      return json;
    });
};
