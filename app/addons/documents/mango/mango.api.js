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

import app from "../../../app";
import {post, get} from '../../../core/ajax';
import FauxtonAPI from "../../../core/api";
import Constants from '../constants';

export const fetchQueryExplain = (databaseName, partitionKey, queryCode) => {
  const encodedPartKey = partitionKey ? encodeURIComponent(partitionKey) : '';
  const url = FauxtonAPI.urls('mango', 'explain-server', encodeURIComponent(databaseName), encodedPartKey);

  return post(url, queryCode, {rawBody: true}).then((json) => {
    if (json.error) {
      throw new Error('(' + json.error + ') ' + json.reason);
    }
    return json;
  });
};

export const createIndex = (databaseName, indexCode) => {
  const url = FauxtonAPI.urls('mango', 'index-server',
    app.utils.safeURLName(databaseName));

  return post(url, indexCode, {rawBody: true}).then((json) => {
    if (json.error) {
      throw new Error('(' + json.error + ') ' + json.reason);
    }
    return json;
  });
};

export const fetchIndexes = (databaseName, params) => {
  const query = app.utils.queryString(params);
  let url = FauxtonAPI.urls('mango', 'index-server', app.utils.safeURLName(databaseName));
  url = `${url}${url.includes('?') ? '&' : '?'}${query}`;

  return get(url).then((json) => {
    if (json.error) {
      throw new Error('(' + json.error + ') ' + json.reason);
    }
    return {
      docs: json.indexes,
      docType: Constants.INDEX_RESULTS_DOC_TYPE.MANGO_INDEX,
      layout: Constants.LAYOUT_ORIENTATION.JSON
    };
  });
};

// assume all databases being accessed are on the same
// host / CouchDB version
let supportsExecutionStatsCache = null;
const supportsExecutionStats = (databaseName) => {
  if (supportsExecutionStatsCache === null) {
    return new FauxtonAPI.Promise((resolve) => {
      mangoQuery(databaseName, '', {
        selector: {
          "_id": {"$gt": "a" }
        },
        execution_stats: true
      }, {limit: 1})
        .then(resp => {
          supportsExecutionStatsCache = resp.status == 200;
          resolve(supportsExecutionStatsCache);
        });
    });
  }
  return Promise.resolve(supportsExecutionStatsCache);
};

// Determines what params need to be sent to couch based on the Mango query entered
// by the user and what fauxton is using to emulate pagination (fetchParams).
export const mergeFetchParams = (queryCode, fetchParams) => {
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

export const mangoQuery = (databaseName, partitionKey, queryCode, fetchParams) => {
  const encodedPartKey = partitionKey ? encodeURIComponent(partitionKey) : '';
  const url = FauxtonAPI.urls('mango', 'query-server', encodeURIComponent(databaseName), encodedPartKey);
  const modifiedQuery = mergeFetchParams(queryCode, fetchParams);
  return post(url, modifiedQuery, {raw: true});
};

export const mangoQueryDocs = (databaseName, partitionKey, queryCode, fetchParams) => {
  // we can only add the execution_stats field if it is supported by the server
  // otherwise Couch throws an error
  return supportsExecutionStats(databaseName).then((shouldFetchExecutionStats) => {
    if (shouldFetchExecutionStats) {
      queryCode.execution_stats = true;
    }
    return mangoQuery(databaseName, partitionKey, queryCode, fetchParams)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          throw new Error('(' + json.error + ') ' + json.reason);
        }
        return {
          docs: json.docs,
          docType: Constants.INDEX_RESULTS_DOC_TYPE.MANGO_QUERY,
          executionStats: json.execution_stats,
          warning: json.warning
        };
      });
  });
};
