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
  getDocUrl,
  isJSONDocEditable,
  isJSONDocBulkDeletable,
  hasBulkDeletableDoc
} from '../index-results/helpers/shared-helpers';
import FauxtonAPI from '../../../core/api';
import '../base';
import sinon from 'sinon';

describe('Docs Shared Helpers', () => {
  describe('getDocUrl', () => {
    const context = 'server';
    const id = 'foo';
    const databaseName = 'testdb';
    let spy;

    beforeEach(() => {
      spy = sinon.spy(FauxtonAPI, 'urls');
    });

    afterEach(() => {
      FauxtonAPI.urls.restore();
    });

    it('requests the proper url with standard inputs', () => {
      getDocUrl(context, id, databaseName);
      expect(spy.calledWith('document', 'server', 'testdb', 'foo', '?conflicts=true'));
    });

    it('requests the proper url when context is undefined', () => {
      let undefinedContext;
      getDocUrl(undefinedContext, id, databaseName);
      expect(spy.calledWith('document', 'server', 'testdb', 'foo', '?conflicts=true'));
    });

    it('requests the proper url when id is undefined', () => {
      let undefinedId;
      getDocUrl(context, undefinedId, databaseName);
      expect(spy.calledWith('document', 'server', 'testdb', '', '?conflicts=true'));
    });
  });

  describe('isJSONDocEditable', () => {
    const doc = {
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
    };
    let docType = 'view';
    let testDoc = Object.assign({}, doc);

    afterEach(() => {
      docType = 'view';
      testDoc = Object.assign({}, doc);
    });

    it('returns undefined when the doc is undefined', () => {
      let undefinedDoc;
      expect(isJSONDocEditable(undefinedDoc, docType)).toBe(undefined);
    });

    it('returns false when type is MangoIndex', () => {
      docType = 'MangoIndex';
      expect(isJSONDocEditable(testDoc, docType)).toBe(false);
    });

    it('returns false when the doc is empty', () => {
      let emptyDoc = {};
      expect(isJSONDocEditable(emptyDoc, docType)).toBe(false);
    });

    it('returns false if the doc does not have an _id', () => {
      delete(testDoc._id);
      expect(isJSONDocEditable(testDoc, docType)).toBe(false);
    });

    it('returns true otherwise', () => {
      expect(isJSONDocEditable(testDoc, docType)).toBe(true);
    });
  });

  describe('isJSONDocBulkDeletable', () => {
    const doc = {
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
    };
    let docType = 'view';
    let testDoc = Object.assign({}, doc);

    afterEach(() => {
      testDoc = Object.assign({}, doc);
      docType = 'view';
    });

    it('returns true for normal doc and views', () => {
      expect(isJSONDocBulkDeletable(testDoc, docType)).toBe(true);
    });

    it('returns false if mango index and doc has type of special', () => {
      docType = 'MangoIndex';
      testDoc.type = 'special';
      expect(isJSONDocBulkDeletable(testDoc, docType)).toBe(false);
    });

    it('returns false if doc does not have _id or id', () => {
      delete(testDoc._id);
      expect(isJSONDocBulkDeletable(testDoc, docType)).toBe(false);
    });

    it('returns false if doc does not have _rev or doc.value.rev', () => {
      delete(testDoc._rev);
      expect(isJSONDocBulkDeletable(testDoc, docType)).toBe(false);
    });
  });

  describe('hasBulkDeletableDoc', () => {
    const docs = [
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
        diet: "omnivore"
      }
    ];
    let docType = 'MangoIndex'

    it('returns true if any docs are bulk deletable', () => {
      expect(hasBulkDeletableDoc(docs, docType)).toBe(true);
    });

    it('returns true when no docs are bulk deletable', () => {
      docs[0].type = 'special';
      expect(hasBulkDeletableDoc(docs, docType)).toBe(false);
    });
  });
});
