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
  hasBulkDeletableDoc,
  getDocId,
  getDocRev
} from '../index-results/helpers/shared-helpers';
import FauxtonAPI from '../../../core/api';
import '../base';
import Constants from '../constants';
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
    let docType = Constants.INDEX_RESULTS_DOC_TYPE.VIEW;
    let testDoc = Object.assign({}, doc);

    afterEach(() => {
      docType = Constants.INDEX_RESULTS_DOC_TYPE.VIEW;
      testDoc = Object.assign({}, doc);
    });

    it('returns undefined when the doc is undefined', () => {
      let undefinedDoc;
      expect(isJSONDocEditable(undefinedDoc, docType)).toBe(undefined);
    });

    it('returns false when type is MangoIndex', () => {
      docType = Constants.INDEX_RESULTS_DOC_TYPE.MANGO_INDEX;
      expect(isJSONDocEditable(testDoc, docType)).toBe(false);
    });

    it('returns false when the doc is empty', () => {
      let emptyDoc = {};
      expect(isJSONDocEditable(emptyDoc, docType)).toBe(false);
    });

    it('returns false if the doc does not have an _id', () => {
      delete (testDoc._id);
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
    let docType = Constants.INDEX_RESULTS_DOC_TYPE.VIEW;
    let testDoc = Object.assign({}, doc);

    afterEach(() => {
      testDoc = Object.assign({}, doc);
      docType = Constants.INDEX_RESULTS_DOC_TYPE.VIEW;
    });

    it('returns true for normal doc and views', () => {
      expect(isJSONDocBulkDeletable(testDoc, docType)).toBe(true);
    });

    it('returns false if mango index and doc has type of special', () => {
      docType = Constants.INDEX_RESULTS_DOC_TYPE.MANGO_INDEX;
      testDoc.type = 'special';
      expect(isJSONDocBulkDeletable(testDoc, docType)).toBe(false);
    });

    it('returns false if doc does not have _id or id', () => {
      delete (testDoc._id);
      expect(isJSONDocBulkDeletable(testDoc, docType)).toBe(false);
    });

    it('returns false if doc does not have _rev or doc.value.rev', () => {
      delete (testDoc._rev);
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
    const docType = Constants.INDEX_RESULTS_DOC_TYPE.MANGO_INDEX;

    it('returns true if any docs are bulk deletable', () => {
      expect(hasBulkDeletableDoc(docs, docType)).toBe(true);
    });

    it('returns true when no docs are bulk deletable', () => {
      docs[0].type = 'special';
      expect(hasBulkDeletableDoc(docs, docType)).toBe(false);
    });
  });

  describe('getDocId', () => {
    it('returns correct ID for docType "view"', () => {
      const docView = {
        id: "20c76d4ff9851694792654ab3e2ca303",
        key: "20c76d4ff9851694792654ab3e2ca303",
        value: {
          rev: "1-c59f5770929653147ab939344b84e933"
        }
      };
      const docType = Constants.INDEX_RESULTS_DOC_TYPE.VIEW;
      expect(getDocId(docView, docType)).toBe(docView.id);
    });

    it('returns correct ID for docType "MangoQueryResult"', () => {
      const docMangoResult = {
        _id: "aardvark",
        _rev: "5-717f5e88689af3ad191b47321de10c95"
      };
      const docType = Constants.INDEX_RESULTS_DOC_TYPE.MANGO_QUERY;
      expect(getDocId(docMangoResult, docType)).toBe(docMangoResult._id);
    });

    it('returns _all_docs as ID for special Mango index', () => {
      const docSpecialMangoIndex = {
        "ddoc": null,
        "name": "_all_docs",
        "type": "special",
        "def": {
          "fields": [{ "_id": "asc" }]
        }
      };
      const docType = Constants.INDEX_RESULTS_DOC_TYPE.MANGO_INDEX;
      expect(getDocId(docSpecialMangoIndex, docType)).toBe('_all_docs');
    });

    it('returns design doc ID as ID for Mango indexes', () => {
      const docMangoIndex = {
        ddoc: "_design/a7ee061f1a2c0c6882258b2f1e148b714e79ccea",
        name: "a7ee061f1a2c0c6882258b2f1e148b714e79ccea",
        type: "json",
        def: { "fields": [{ "foo": "asc" }] }
      };
      const docType = Constants.INDEX_RESULTS_DOC_TYPE.MANGO_INDEX;
      expect(getDocId(docMangoIndex, docType)).toBe(docMangoIndex.ddoc);
    });
  });

  describe('getDocRev', () => {
    it('returns document revision for docType "view"', () => {
      const docView = {
        id: "20c76d4ff9851694792654ab3e2ca303",
        key: "20c76d4ff9851694792654ab3e2ca303",
        value: {
          rev: "1-c59f5770929653147ab939344b84e933"
        }
      };
      const docType = Constants.INDEX_RESULTS_DOC_TYPE.VIEW;
      expect(getDocRev(docView, docType)).toBe(docView.value.rev);
    });

    it('returns document revision for docType "view" and only doc', () => {
      const docView = {
        id: "20c76d4ff9851694792654ab3e2ca303",
        _rev: "1-c59f5770929653147ab939344b84e933"
      };
      const docType = Constants.INDEX_RESULTS_DOC_TYPE.VIEW;
      expect(getDocRev(docView, docType)).toBe(docView._rev);
    });


    it('returns document revision for docType "MangoQueryResult"', () => {
      const docMangoResult = {
        _id: "aardvark",
        _rev: "5-717f5e88689af3ad191b47321de10c95"
      };
      const docType = Constants.INDEX_RESULTS_DOC_TYPE.MANGO_QUERY;
      expect(getDocRev(docMangoResult, docType)).toBe(docMangoResult._rev);
    });

    it('returns undefined as revision for special Mango index', () => {
      const docSpecialMangoIndex = {
        "ddoc": null,
        "name": "_all_docs",
        "type": "special",
        "def": {
          "fields": [{ "_id": "asc" }]
        }
      };
      const docType = Constants.INDEX_RESULTS_DOC_TYPE.MANGO_INDEX;
      expect(getDocRev(docSpecialMangoIndex, docType)).toBe(undefined);
    });

    it('returns undefined as revision for Mango indexes', () => {
      const docMangoIndex = {
        ddoc: "_design/a7ee061f1a2c0c6882258b2f1e148b714e79ccea",
        name: "a7ee061f1a2c0c6882258b2f1e148b714e79ccea",
        type: "json",
        def: { "fields": [{ "foo": "asc" }] }
      };
      const docType = Constants.INDEX_RESULTS_DOC_TYPE.MANGO_INDEX;
      expect(getDocRev(docMangoIndex, docType)).toBe(undefined);
    });
  });
});
