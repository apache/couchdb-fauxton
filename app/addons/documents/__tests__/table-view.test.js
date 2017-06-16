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

import {
  getPseudoSchema,
  getPrioritizedFields,
  sortByTwoFields,
  getNotSelectedFields,
  getMetaDataTableView,
  getFullTableViewData
} from '../index-results/helpers/table-view';

describe('Docs Table View', () => {
  const docs = [
    {
      _id: "badger",
      _rev: "8-db03387de9cbd5c2814523b043566dfe",
      wiki_page: "http://en.wikipedia.org/wiki/Badger",
      min_weight: 7,
      max_weight: 30,
      min_length: 0.6,
      max_length: 0.9,
      latin_name: "Meles meles",
      class: "mammal",
      diet: "omnivore",
      test: "xyz"
    },
    {
      _id: "aardvark",
      _rev: "5-717f5e88689af3ad191b47321de10c95",
      min_weight: 40,
      max_weight: 65,
      min_length: 1,
      max_length: 2.2,
      latin_name: "Orycteropus afer",
      wiki_page: "http://en.wikipedia.org/wiki/Aardvark",
      class: "mammal",
      diet: "omnivore",
      foo: "bar"
    }
  ];

  const schema = [
    '_id',
    '_rev',
    'wiki_page',
    'min_weight',
    'max_weight',
    'min_length',
    'max_length',
    'latin_name',
    'class',
    'diet',
    'test',
    'foo'
  ];

  describe('getPseudoSchema', () => {
    it('returns array of unique keys with _id as the first element', () => {
      expect(getPseudoSchema(docs)).toEqual(schema);
    });
  });

  describe('getPrioritizedFields', () => {
    it('returns the list of most popular attributes', () => {
      const max = 5;
      expect(getPrioritizedFields(docs, max)).toEqual([
        '_id',
        'class',
        'diet',
        'latin_name',
        'max_length'
      ]);
    });
  });

  describe('sortByTowFields', () => {
    it('returns proper sorted array for the input', () => {
      const input = [[2, 'b'], [3, 'z'], [1, 'a'], [3, 'a']];
      expect(sortByTwoFields(input)).toEqual([
        [3, 'a'],
        [3, 'z'],
        [2, 'b'],
        [1, 'a']
      ]);
    });
  });

  describe('getNotSelectedFields', () => {
    it('returns a list of the remaining fields not currently selected', () => {
      const selectedFields = ['_id', 'class', 'diet', 'latin_name', 'max_length'];
      const allFields = ['_id', '_rev', 'wiki_page', 'min_weight', 'max_weight', 'min_length', 'max_length', 'latin_name', 'class', 'diet', 'test', 'foo'];
      expect(getNotSelectedFields(selectedFields, allFields)).toEqual([
        '_rev',
        'wiki_page',
        'min_weight',
        'max_weight',
        'min_length',
        'test',
        'foo'
      ]);
    });
  });

  describe('getFullTableViewData', () => {
    let schemaWithoutMetaDataFields;
    beforeEach(() => {
      schemaWithoutMetaDataFields = _.without(schema, '_attachments');
    });

    it('returns json object with attributes necessary when selectedFieldsTableView is not set', () => {
      const max = 5;
      const selectedFieldsTableView = getPrioritizedFields(docs, max);
      const notSelectedFieldsTableView = getNotSelectedFields(selectedFieldsTableView, schemaWithoutMetaDataFields);
      const options = {
        selectedFieldsTableView: [],
        showAllFieldsTableView: false
      };

      expect(getFullTableViewData(docs, options)).toEqual({
        schema,
        normalizedDocs: docs,
        selectedFieldsTableView,
        notSelectedFieldsTableView
      });
    });

    it('returns json object with attributes necessary when selectedFieldsTableView is set', () => {
      const selectedFieldsTableView = ['_id', 'class', 'diet', 'latin_name', 'max_length'];
      const notSelectedFieldsTableView = getNotSelectedFields(selectedFieldsTableView, schemaWithoutMetaDataFields);
      const options = {
        selectedFieldsTableView,
        showAllFieldsTableView: false
      };

      expect(getFullTableViewData(docs, options)).toEqual({
        schema,
        normalizedDocs: docs,
        selectedFieldsTableView,
        notSelectedFieldsTableView
      });
    });

    it('returns json object with attributes necessary when showAllFieldsTableView is set', () => {
      const selectedFieldsTableView = ['_id', 'class', 'diet', 'latin_name', 'max_length'];
      const options = {
        selectedFieldsTableView,
        showAllFieldsTableView: true
      };

      expect(getFullTableViewData(docs, options)).toEqual({
        schema,
        normalizedDocs: docs,
        selectedFieldsTableView: schemaWithoutMetaDataFields,
        notSelectedFieldsTableView: null
      });
    });
  });

  describe('getMetaDataTableView', () => {
    it('returns json object with attributes necessary to build metadata table', () => {
      expect(getMetaDataTableView(docs)).toEqual({
        schema: schema,
        normalizedDocs: docs,
        selectedFieldsTableView: schema,
        notSelectedFieldsTableView: null
      });
    });
  });
});
