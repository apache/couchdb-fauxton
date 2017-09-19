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
import queryString from 'query-string';
import app from "../../../app";
import FauxtonAPI from "../../../core/api";
import Constants from '../constants';

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

export const fetchIndexes = (databaseName, params) => {
  const query = queryString.stringify(params);
  let url = FauxtonAPI.urls('mango', 'index-server', app.utils.safeURLName(databaseName));
  url = `${url}${url.includes('?') ? '&' : '?'}${query}`;

  return fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8'
    },
    credentials: 'include',
    method: 'GET'
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.error) {
        throw new Error('(' + json.error + ') ' + json.reason);
      }
      return {
        docs: json.indexes,
        docType: Constants.INDEX_RESULTS_DOC_TYPE.MANGO_INDEX
      };
    });
};

// Determines what params need to be sent to couch based on the Mango query entered
// by the user and what fauxton is using to emulate pagination (fetchParams).
const mergeFetchParams = (queryCode, fetchParams) => {
  // Since Fauxton pagination's 'limit' is always (docs-per-page + 1), this ensures
  // (page-number * docs-per-page) doesn't exceed the query's 'limit' value.
  let limit = fetchParams.limit;
  const docsPerPage = fetchParams.limit - 1;
  const pageNumber = Math.floor(fetchParams.skip / docsPerPage) + 1;
  const docsOverLimit = (pageNumber * docsPerPage) - queryCode.limit;
  if (docsOverLimit >= 0) {
    limit = docsPerPage - docsOverLimit;
  }

  return {
    ...queryCode,
    limit: limit,
    skip: queryCode.skip ? (fetchParams.skip + queryCode.skip) : fetchParams.skip
  };
};

export const mangoQueryDocs = (databaseName, queryCode, fetchParams) => {
  const url = FauxtonAPI.urls('mango', 'query-server', databaseName);
  const modifiedQuery = mergeFetchParams(queryCode, fetchParams);
  return fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8'
    },
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify(modifiedQuery)
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.error) {
        throw new Error('(' + json.error + ') ' + json.reason);
      }
      return {
        docs: json.docs,
        docType: Constants.INDEX_RESULTS_DOC_TYPE.MANGO_QUERY
      };
    });
};
