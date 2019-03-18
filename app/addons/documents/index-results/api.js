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

import '@webcomponents/url';
import {get, post} from '../../../core/ajax';
import app from '../../../app';
import Constants from '../constants';
import FauxtonAPI from '../../../core/api';

export const queryAllDocs = (fetchUrl, partitionKey, params) => {
  // Exclude params 'group', 'reduce' and 'group_level' if present since they not allowed for '_all_docs'
  Object.assign(params, {reduce: undefined, group: undefined, group_level: undefined});
  const query = app.utils.queryString(params);
  const url = `${fetchUrl}${fetchUrl.includes('?') ? '&' : '?'}${query}`;
  return get(url).then(json => {
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
  // removes params not supported by partitioned views
  const isPartitioned = fetchUrl.includes('/_partition/');
  if (isPartitioned) {
    params.stable = undefined;
    params.conflicts = undefined;
  }
  const query = app.utils.queryString(params);
  const url = `${fetchUrl}${fetchUrl.includes('?') ? '&' : '?'}${query}`;
  return get(url).then(json => {
    if (json.error) {
      throw new Error('(' + json.error + ') ' + json.reason);
    }
    return {
      docs: json.rows,
      docType: Constants.INDEX_RESULTS_DOC_TYPE.VIEW,
      layout: undefined
    };
  });
};

export const postToBulkDocs = (databaseName, payload) => {
  const url = FauxtonAPI.urls('bulk_docs', 'server', databaseName);
  return post(url, payload);
};

export const postToIndexBulkDelete = (databaseName, payload) => {
  const url = FauxtonAPI.urls('mango', 'index-server-bulk-delete', encodeURIComponent(databaseName));
  return post(url, payload);
};
