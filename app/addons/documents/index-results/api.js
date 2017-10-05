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
import 'whatwg-fetch';
import queryString from 'query-string';
import Constants from '../constants';
import FauxtonAPI from '../../../core/api';

export const queryAllDocs = (fetchUrl, params) => {
  // Exclude params 'group', 'reduce' and 'group_level' if present since they not allowed for '_all_docs'
  Object.assign(params, {reduce: undefined, group: undefined, group_level: undefined});
  const query = queryString.stringify(params);
  const url = `${fetchUrl}${fetchUrl.includes('?') ? '&' : '?'}${query}`;
  return fetch(url, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json; charset=utf-8'
    }
  })
  .then(res => res.json())
  .then(json => {
    if (json.error) {
      throw new Error('(' + json.error + ') ' + json.reason);
    }
    return {
      docs: json.rows,
      docType: Constants.INDEX_RESULTS_DOC_TYPE.VIEW
    };
  });
};

export const queryMapReduceView = (fetchUrl, params) => {
  // Adds the 'reduce' param in case it's not defined
  if (params.reduce === undefined) {
    params.reduce = false;
  }
  // reduce cannot be true when include_docs is true
  if (params.include_docs && params.reduce) {
    params.reduce = false;
    params.group = undefined;
    params.group_level = undefined;
  }
  const query = queryString.stringify(params);
  const url = `${fetchUrl}${fetchUrl.includes('?') ? '&' : '?'}${query}`;
  return fetch(url, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json; charset=utf-8'
    }
  })
  .then(res => res.json())
  .then(json => {
    if (json.error) {
      throw new Error('(' + json.error + ') ' + json.reason);
    }
    return {
      docs: json.rows,
      docType: Constants.INDEX_RESULTS_DOC_TYPE.VIEW
    };
  });
};

export const postToBulkDocs = (databaseName, payload) => {
  const url = FauxtonAPI.urls('bulk_docs', 'server', databaseName);
  return fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(payload),
    headers: {
      'Accept': 'application/json; charset=utf-8',
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json());
};

export const postToIndexBulkDelete = (databaseName, payload) => {
  const url = FauxtonAPI.urls('mango', 'index-server-bulk-delete', encodeURIComponent(databaseName));
  return fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(payload),
    headers: {
      'Accept': 'application/json; charset=utf-8',
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json());
};
