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

import 'url-polyfill';
//import app from '../../app';
//import FauxtonAPI from '../../core/api';
//import base64 from 'base-64';
//import _ from 'lodash';
import 'whatwg-fetch';
import queryString from 'query-string';

const fetchAllDocs = (databaseName, params) => {
  const query = queryString.stringify(params);
  return fetch(`/${databaseName}/_all_docs?${query}`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json; charset=utf-8'
    }
  })
  .then(res => res.json())
  .then((res) => {
    return res.error ? [] : res;
  });
};

const bulkDeleteDocs = (databaseName, docs) => {
  return fetch(`/${databaseName}`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(docs),
    headers: {
      'Accept': 'application/json; charset=utf-8',
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json());
};

export default {
  fetchAllDocs,
  bulkDeleteDocs
};
