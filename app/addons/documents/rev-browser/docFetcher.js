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

import app from '../../../app';
import { get } from "../../../core/ajax";

/**
 * Object able to fetch documents from a CouchDB database.
 * @typedef {Object} DocFetcher
 * @property {function} getDoc - Function to retrieve a document
 */


/**
 * Create a document fetcher object for retrieving documents from
 * a CouchDB database.
 *
 * @param {string} databaseURL
 * @returns {DocFetcher} a new fetcher
 */
function docFetcher(databaseURL) {
  try {
    new URL(databaseURL);
  } catch (_) {
    throw new Error(`Invalid database URL: ${databaseURL}`);
  }
  return {
    getDoc: (docId, params) => {
      return getDbDoc(databaseURL, docId, params);
    }
  };
}

/**
 * Fetches a CouchDB document.
 *
 * @param {*} databaseURL Databse URL
 * @param {*} docId Document ID
 * @param {*} params Query parameters allowed on GET /{db}/{doc} endpoint
 * @returns {Promise}
 */
function getDbDoc(databaseURL, docId, params) {
  if (!docId) {
    return Promise.reject(new Error("Invalid document ID"));
  }
  let queryParameters = "";
  if (params && typeof params === "object") {
    queryParameters = "?" + app.utils.queryParams(params);
  }
  let docURLPath = '';
  if (docId.startsWith("_design/")) {
    const ddocName = docId.substring(8);
    docURLPath = "_design/" + encodeURIComponent(ddocName);
  } else {
    docURLPath = encodeURIComponent(docId);
  }
  const docURL = `${databaseURL}/${docURLPath}${queryParameters}`;
  return get(docURL).then(json => {
    if (json.error) {
      const err = new Error(json.error);
      err.reason = json.reason;
      err.error = json.error;
      throw err;
    }
    return json;
  });
}

export default docFetcher;
