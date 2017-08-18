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
import MangoHelper from "../../mango/mango.helper";

export const getJsonViewData = (docs, { databaseName, docType }) => {

  // expand on this when refactoring views to use redux
  const stagedResults = docs.map((doc) => {
    if (docType === "MangoIndex") {
      return {
        header: MangoHelper.getIndexName(doc),
        content: MangoHelper.getIndexContent(doc),
        id: doc.type === 'special' ? '_all_docs' : doc.ddoc,
        keylabel: '',
        url: doc.id ? getDocUrl('app', doc.id, databaseName) : null,
        isDeletable: doc.type !== 'special',
        isEditable: false
      };
    }
    return {
      header: doc.id,
      content: JSON.stringify(doc, null, ' '),
      id: doc.id || (doc.key && doc.key.toString()),
      _rev: doc._rev || (doc.value && doc.value.rev),
      keylabel: 'id',
      url: doc.id ? getDocUrl('app', doc.id, databaseName) : null,
      isDeletable: true,
      isEditable: true
    };
  });

  return {
    displayedFields: null,
    hasBulkDeletableDoc: hasBulkDeletableDoc(docs, docType),
    results: stagedResults
  };
};
