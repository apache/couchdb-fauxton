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

import { getJsonViewData } from '../index-results/helpers/json-view';
import { getDocUrl } from '../index-results/helpers/shared-helpers';
import '../base';
import Constants from '../constants';

describe('Docs JSON View', () => {
  const databaseName = 'testdb';
  let docType = Constants.INDEX_RESULTS_DOC_TYPE.VIEW;
  const docs = [
    {
      id: "aardvark",
      key: "aardvark",
      value: {
        rev: "5-717f5e88689af3ad191b47321de10c95"
      },
      doc: {
        _id: "aardvark",
        _rev: "5-717f5e88689af3ad191b47321de10c95",
        min_weight: 40,
        max_weight: 65,
        min_length: 1,
        max_length: 2.2,
        latin_name: "Orycteropus afer",
        wiki_page: "http://en.wikipedia.org/wiki/Aardvark",
        class: "mammal",
        diet: "omnivore"
      }
    },
    {
      id: "badger",
      key: "badger",
      value: {
        rev: "8-db03387de9cbd5c2814523b043566dfe"
      },
      doc: {
        _id: "badger",
        _rev: "8-db03387de9cbd5c2814523b043566dfe",
        wiki_page: "http://en.wikipedia.org/wiki/Badger",
        min_weight: 7,
        max_weight: 30,
        min_length: 0.6,
        max_length: 0.9,
        latin_name: "Meles meles",
        class: "mammal",
        diet: "omnivore"
      }
    }
  ];
  const mangoIndexes = [
    {ddoc: null, name: "_all_docs", type: "special", def: {fields: [{_id: "asc"}]}},
    {ddoc: "_design/34223ecd7b6bcdc4dcdbc1a09bd63db365dd5f69", name: "idx1", type: "json", def: {fields: [{host3: "asc"}]}}
  ];
  let testDocs;

  beforeEach(() => {
    testDocs = docs;
    docType = Constants.INDEX_RESULTS_DOC_TYPE.VIEW;
  });

  it('getJsonViewData returns proper meta object with vanilla inputs', () => {
    expect(getJsonViewData(testDocs, {databaseName, docType})).toEqual({
      displayedFields: null,
      hasBulkDeletableDoc: true,
      results: [
        {
          content: JSON.stringify(testDocs[0], null, ' '),
          id: testDocs[0].id,
          _rev: testDocs[0].value.rev,
          header: testDocs[0].id,
          keylabel: 'id',
          url: getDocUrl('app', testDocs[0].id, databaseName),
          isDeletable: true,
          isEditable: true
        },
        {
          content: JSON.stringify(testDocs[1], null, ' '),
          id: testDocs[1].id,
          _rev: testDocs[1].value.rev,
          header: testDocs[1].id,
          keylabel: 'id',
          url: getDocUrl('app', testDocs[1].id, databaseName),
          isDeletable: true,
          isEditable: true
        }
      ]
    });
  });

  it('getJsonViewData false hasBulkDeletableDoc when all special mango docs', () => {
    docType = Constants.INDEX_RESULTS_DOC_TYPE.MANGO_INDEX;
    testDocs = mangoIndexes;
    testDocs[0].type = 'special';
    testDocs[1].type = 'special';

    const idx0 = { ...testDocs[0] };
    delete idx0.ddoc;
    delete idx0.name;
    const idx1 = { ...testDocs[1] };
    delete idx1.ddoc;
    delete idx1.name;

    expect(getJsonViewData(testDocs, {databaseName, docType})).toEqual({
      displayedFields: null,
      hasBulkDeletableDoc: false,
      results: [
        {
          content: JSON.stringify(idx0, null, ' '),
          id: mangoIndexes[0].name,
          _rev: undefined,
          header: 'special: _id',
          keylabel: '',
          url: null,
          isDeletable: false,
          isEditable: false
        },
        {
          content: JSON.stringify(idx1, null, ' '),
          id: '_all_docs',
          _rev: undefined,
          header: 'special: host3',
          keylabel: '',
          url: null,
          isDeletable: false,
          isEditable: false
        }
      ]
    });
  });
});
