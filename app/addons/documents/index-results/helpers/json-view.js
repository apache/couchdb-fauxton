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

import { hasBulkDeletableDoc, getDocUrl } from "./shared-helpers";

export const getJsonViewData = (docs, { databaseName, typeOfIndex }) => {
  // expand on this when refactoring views and mango to use redux
  const stagedResults = docs.map((doc) => {
    return {
      content: JSON.stringify(doc, null, ' '),
      id: doc.id, //|| doc.key.toString(),
      _rev: doc._rev || (doc.value && doc.value.rev),
      header: doc.id, //|| doc.key.toString(),
      keylabel: 'id', //doc.isFromView() ? 'key' : 'id',
      url: doc.id ? getDocUrl('app', doc.id, databaseName) : null,
      isDeletable: true,
      isEditable: true
    };
  });

  return {
    displayedFields: null,
    hasBulkDeletableDoc: hasBulkDeletableDoc(docs, typeOfIndex),
    results: stagedResults
  };
};
