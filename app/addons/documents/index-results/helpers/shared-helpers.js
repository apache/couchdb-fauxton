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

import app from "../../../../app";
import FauxtonAPI from "../../../../core/api";

const getDocUrl = (context, id, databaseName) => {
  if (context === undefined) {
    context = 'server';
  }

  // new without id make a POST to the DB and not a PUT on a DB
  let safeId = app.utils.getSafeIdForDoc(id);
  if (!safeId) {
    safeId = '';
  }
  const safeDatabaseName = encodeURIComponent(databaseName);

  return FauxtonAPI.urls('document', context, safeDatabaseName, safeId, '?conflicts=true');
};

const isJSONDocEditable = (doc, docType) => {

  if (!doc) {
    return;
  }

  if (docType === 'MangoIndex') {
    return false;
  }

  if (!Object.keys(doc).length) {
    return false;
  }

  if (!doc._id) {
    return false;
  }

  return true;
};

const isJSONDocBulkDeletable = (doc, docType) => {
  if (docType === 'MangoIndex') {
    return doc.type !== 'special';
  }
  const result = (doc._id || doc.id) && (doc._rev || (doc.value && doc.value.rev));
  return !!result;
};

const hasBulkDeletableDoc = (docs, docType) => {
  const doc = docs.find((doc) => {
    return isJSONDocBulkDeletable(doc, docType);
  });

  return !!doc;
};

// if we've previously set the perPage in local storage, default to that.
const getDefaultPerPage = () => {
  if (window.localStorage) {
    const storedPerPage = app.utils.localStorageGet('fauxton:perpageredux');
    if (storedPerPage) {
      return parseInt(storedPerPage, 10);
    }
  }
  return FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE;
};

export {
  getDocUrl,
  isJSONDocEditable,
  isJSONDocBulkDeletable,
  hasBulkDeletableDoc,
  getDefaultPerPage
};
