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

describe('Docs JSON View', () => {
  const databaseName = 'testdb';
  let typeOfIndex = 'view';
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
  let testDocs;

  beforeEach(() => {
    testDocs = docs;
    typeOfIndex = 'view';
  });

  it('getJsonViewData returns proper meta object with vanilla inputs', () => {
    expect(getJsonViewData(testDocs, {databaseName, typeOfIndex})).toEqual({
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
    typeOfIndex = 'MangoIndex';
    testDocs[0].type = 'special';
    testDocs[1].type = 'special';

    expect(getJsonViewData(testDocs, {databaseName, typeOfIndex})).toEqual({
      displayedFields: null,
      hasBulkDeletableDoc: false,
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
});
