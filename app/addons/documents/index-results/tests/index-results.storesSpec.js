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

import FauxtonAPI from "../../../../core/api";
import Stores from "../stores";
import ActionTypes from "../actiontypes";
import Documents from "../../resources";
import documentTestHelper from "../../tests/document-test-helper";
import testUtils from "../../../../../test/mocha/testUtils";
import sinon from "sinon";
var assert = testUtils.assert;
var dispatchToken;
var store;
var opts;

var createDocColumn = documentTestHelper.createDocColumn;
var createMangoIndexDocColumn = documentTestHelper.createMangoIndexDocColumn;

describe('Index Results Store', function () {
  beforeEach(function () {
    store = new Stores.IndexResultsStore();
    store.dispatchToken = FauxtonAPI.dispatcher.register(store.dispatch);
    store.reset();
    opts = {
      params: {limit: 10, skip: 0},
      database: {
        safeID: function () { return '1';}
      }
    };

    store.newResults({
      collection: createDocColumn([
        {_id: 'testId5', _rev: '1', 'value': 'one'},
        {_id: 'testId6', _rev: '1', 'value': 'one'}
      ]),
      bulkCollection: new Documents.BulkDeleteDocCollection([], { databaseId: '1' })
    });
  });

  afterEach(function () {
    FauxtonAPI.dispatcher.unregister(store.dispatchToken);
  });


  it('hasResults returns true for collection', function () {
    store.newResults({
      collection: createDocColumn([
        {_id: 'testId5', _rev: '1', 'value': 'one'},
        {_id: 'testId6', _rev: '1', 'value': 'one'}
      ]),
      bulkCollection: new Documents.BulkDeleteDocCollection([], { databaseId: '1' })
    });

    assert.ok(store.hasResults());
  });

  it('can sort 2 dimensional arrays by the first value', function () {
    var a = [
      [20, 5],
      [1, 2],
      [3, 4]
    ];
    var res = store.sortByTwoFields(a);

    assert.equal(a[0][0], 20);
    assert.equal(a[1][0], 3);
    assert.equal(a[2][0], 1);
  });

  it('can sort 2 dimensional arrays by the second value if multiple appear', function () {
    var a = [
      [1, "z"],
      [1, "g"],
      [1, "a"]
    ];
    var res = store.sortByTwoFields(a);

    assert.equal(a[0][1], 'a');
    assert.equal(a[1][1], 'g');
    assert.equal(a[2][1], 'z');
  });


  it('hasResults returns false for empty collection', function () {
    store._collection = [];

    assert.notOk(store.hasResults());
  });

  it('getResults has correct doc format', function () {
    store.newResults({
      collection: createDocColumn([
        {_id: 'testId', _rev: '1', 'value': 'one'},
      ])
    });

    var doc = store.getResults().results[0];
    assert.equal(doc.id, 'testId');
    assert.equal(doc.keylabel, 'id');
  });

  it('tries to guess a pseudo schema for table views', function () {
    var doclist = [
      {_id: 'testId1', value: 'one'},
      {_id: 'testId2', foo: 'one'},
      {_id: 'testId3', bar: 'one'},
    ];

    var schema = store.getPseudoSchema(doclist);

    assert.ok(schema.indexOf('_id') !== -1);
    assert.ok(schema.indexOf('value') !== -1);
    assert.ok(schema.indexOf('foo') !== -1);
    assert.ok(schema.indexOf('bar') !== -1);
  });

  it('uses unique values for the pseudo schema', function () {
    var doclist = [
      {_id: 'testId1', foo: 'one'},
      {_id: 'testId2', foo: 'one'}
    ];

    var schema = store.getPseudoSchema(doclist);

    assert.equal(schema.length, 2);
    assert.equal(schema.length, 2);
    assert.ok(schema.indexOf('foo') !== -1);
    assert.ok(schema.indexOf('_id') !== -1);
  });

  it('puts the id into the array as first element', function () {
    var doclist = [
      {foo: 'one', _id: 'testId1'},
      {foo: 'one', _id: 'testId2'}
    ];

    var schema = store.getPseudoSchema(doclist);

    assert.equal(schema.shift(), '_id');
  });

  it('normalizes different content from include_docs enabled', function () {
    var doclist = [
      {_id: 'testId2', foo: 'one', doc: {"_rev": "1", "ente": "gans", "fuchs": "hase"}},
      {_id: 'testId3', foo: 'two', doc: {"_rev": "2", "haus": "blau", "tanne": "acht"}}
    ];

    var res = store.normalizeTableData(doclist);
    assert.deepEqual(res[0], {"_rev": "1", "ente": "gans", "fuchs": "hase"});
  });

  it('returns the fields that occure the most without id and rev', function () {
    var doclist = [
      {_rev: '1', _id: '1', id: 'testId2', foo: 'one'},
      {_rev: '1', _id: '1', id: 'testId3', foo: 'two'}
    ];

    var res = store.getPrioritizedFields(doclist, 10);
    assert.deepEqual(res, ['foo']);
  });

  it('sorts the fields that occure the most', function () {
    var doclist = [
      {id: 'testId2', foo: 'one'},

      {id: 'testId3', bar: 'two'},
      {id: 'testId3', bar: 'two'},
      {id: 'testId3', baz: 'two'},
      {id: 'testId3', baz: 'two'}
    ];

    var res = store.getPrioritizedFields(doclist, 10);
    assert.deepEqual(res, ['bar', 'baz', 'foo']);
  });

  it('limits the fields that occure the most', function () {
    var doclist = [
      {id: 'testId2', foo: 'one'},

      {id: 'testId3', bar: 'two'},
      {id: 'testId3', bar: 'two'},
      {id: 'testId3', baz: 'two'},
      {id: 'testId3', baz: 'two'}
    ];

    var res = store.getPrioritizedFields(doclist, 2);
    assert.deepEqual(res, ['bar', 'baz']);
  });

  it('if the collection is empty, no docs should be selected', function () {
    store._collection = new Documents.AllDocs([], opts);

    assert.notOk(store.areAllDocumentsSelected());
  });

  it('if the collection changes, not all docs should be selected', function () {
    store._collection = createDocColumn([
      {_id: 'testId1', _rev: '1', 'value': 'one'},
      {_id: 'testId2', _rev: '1', 'value': 'one'}
    ]);

    store.selectAllDocuments();

    store._collection = createDocColumn([
      {_id: 'testId5', _rev: '1', 'value': 'one'},
      {_id: 'testId6', _rev: '1', 'value': 'one'}
    ]);

    assert.notOk(store.areAllDocumentsSelected());
  });

  it('special mango docs are not selectable, but all should be selected', function () {
    store._collection = createMangoIndexDocColumn([
      {ddoc: 'testId1', type: 'special', def: {fields: [{_id: 'desc'}]}},
      {ddoc: 'testId2', blubb: 'ba', type: 'json', def: {fields: [{_id: 'desc'}]}}
    ]);

    store.selectAllDocuments();

    assert.ok(store.areAllDocumentsSelected());
  });

  it('returns true for selected docs less than collection', function () {
    store._collection = createDocColumn([
      {_id: 'testId1', _rev: 'foo'},
      {_id: 'testId2', _rev: 'foo'}
    ]);

    store._selectedItems = {'testId1': true};
    assert.notOk(store.areAllDocumentsSelected());
  });

  it('returns true even with _all_docs (mango)', function () {
    store._collection = new Documents.AllDocs([
      {_id: 'testId1'},
      {_id: 'testId2'},
      {_id: '_all_docs'}
    ], opts);

    store._selectedItems = {
      'testId1': true,
      'testId2': true
    };

    assert.ok(store.areAllDocumentsSelected());
  });

  it('does not count multiple fields in the prioritzed table', function () {
    store.newResults({
      collection: createDocColumn([
        {a: '1', 'value': 'one', b: '1'},
        {a: '1', 'value': 'one', b: '1'},
        {a: '1', 'value': 'one', b: '1'}
      ])
    });

    store.getResults();

    store.toggleTableView({enable: true});
    store.getResults();

    store.changeTableViewFields({index: 0, newSelectedRow: 'value'});

    var stub = sinon.stub(store, 'isIncludeDocsEnabled');
    stub.returns(true);

    assert.deepEqual(store.getDisplayCountForTableView(), { shown: 2, allFieldCount: 3 });
  });

  it('id and rev count as one field, because of the combined metadata field', function () {
    store.newResults({
      collection: createDocColumn([
        {_id: 'foo1', _rev: 'bar', a: '1', 'value': 'one', b: '1'},
        {_id: 'foo2', _rev: 'bar', a: '1', 'value': 'one', b: '1'},
        {_id: 'foo3', _rev: 'bar', a: '1', 'value': 'one', b: '1'}
      ]),
      bulkCollection: new Documents.BulkDeleteDocCollection([], { databaseId: '1' })
    });

    store.toggleTableView({enable: true});

    var stub = sinon.stub(store, 'isIncludeDocsEnabled');
    stub.returns(true);
    store.getResults();

    assert.deepEqual(store.getDisplayCountForTableView(), { shown: 4, allFieldCount: 4 });
  });

  it('selectDoc selects doc if not already selected', function () {
    store._collection = new createDocColumn([
      {_id: 'id', _rev: '1', 'value': 'one'},
      {_id: 'testId6', _rev: '1', 'value': 'one'}
    ]);
    store.selectDoc({_id: 'id', _rev: '1'});
    assert.equal(store.getSelectedItemsLength(), 1);
  });

  it('selectDoc deselects doc if already selected', function () {
    store.selectDoc({_id: 'id', _rev: '1'});
    store._collection = new createDocColumn([
      {_id: 'id', _rev: '1', 'value': 'one'},
      {_id: 'testId6', _rev: '1', 'value': 'one'}
    ]);
    store.selectDoc({_id: 'id', _rev: '1'});
    assert.equal(store.getSelectedItemsLength(), 0);
  });

  it('selectDoc selects all documents', function () {
    store._collection = createDocColumn([{_id: 'testId1', _rev: '1', 'value': 'one'}]);

    store.selectAllDocuments();
    assert.ok(store._bulkDeleteDocCollection.get('testId1'));
  });

  it('selectDoc does not select all documents if rev is missing', function () {
    store._collection = createDocColumn([{_id: 'testId1', 'value': 'one'}]);

    store.selectAllDocuments();
    assert.equal(store.getSelectedItemsLength(), 0);
  });

});
describe('toggleSelectAllDocuments', function () {

  it('deselects all documents', function () {
    store._collection = new Documents.AllDocs([{_id: 'testId1', _rev: '1', 'value': 'one'}], opts);

    store.selectAllDocuments();
    assert.ok(store._bulkDeleteDocCollection.get('testId1'));
    store.toggleSelectAllDocuments();
    assert.equal(store.getSelectedItemsLength(), 0);
  });

  it('deselects all documents with toggleSelectAllDocuments', function () {
    store.reset();
    store._collection = new Documents.AllDocs([{_id: 'testId1', _rev: '1', 'value': 'one'}], opts);

    assert.equal(store._bulkDeleteDocCollection.length, 0);
    store.toggleSelectAllDocuments();
    assert.equal(store.getSelectedItemsLength(), 1);
  });
});

describe('#getMangoDoc', function () {
  beforeEach(function () {
    store = new Stores.IndexResultsStore();
    dispatchToken = FauxtonAPI.dispatcher.register(store.dispatch);
    opts = {
      params: {},
      database: {
        safeID: function () { return '1';}
      }
    };
  });

  var fakeMango = {
    ddoc: '_design/e4d338e5d6f047749f5399ab998b4fa04ba0c816',
    def: {
      fields: [
        {'_id': 'asc'},
        {'foo': 'bar'},
        {'ente': 'gans'}
      ]
    },
    name: 'e4d338e5d6f047749f5399ab998b4fa04ba0c816',
    type: 'json'
  };

  it('creates a special id from the header fields', function () {
    var doc = new Documents.MangoIndex(fakeMango, opts);
    assert.equal(store.getMangoDoc(doc).header, 'json: _id, foo, ente');
  });

  it('supports custom header fields', function () {
    FauxtonAPI.registerExtension('mango:additionalIndexes', {
      createHeader: function (doc) {
        return ['foobar'];
      }
    });

    var doc = new Documents.MangoIndex({
      ddoc: '_design/e4d338e5d6f047749f5399ab998b4fa04ba0c816',
      def: {
        fields: []
      },
      name: 'e4d338e5d6f047749f5399ab998b4fa04ba0c816',
      type: 'json'
    }, opts);
    assert.equal(store.getMangoDoc(doc).header, 'foobar');
  });

  it('removes the name and ddoc field', function () {
    var doc = new Documents.MangoIndex(fakeMango, opts);
    assert.ok(doc.get('name'));
    assert.ok(doc.get('ddoc'));

    store._allCollapsed = false;
    var newDoc = store.getMangoDoc(doc);
    assert.notOk(JSON.parse(newDoc.content).name);
    assert.notOk(JSON.parse(newDoc.content).ddoc);
    assert.ok(JSON.parse(newDoc.content).type);
  });
});

describe('#getDocId', function () {

  it('returns id if it exists', function () {
    var doc = new Documents.Doc({
      _id: 'doc-id'
    }, opts);

    assert.equal(store.getDocId(doc), 'doc-id');

  });

  it('returns key if it exists', function () {
    var doc = new Documents.Doc({
      key: 'doc-key'
    }, opts);

    assert.equal(store.getDocId(doc), 'doc-key');

  });

  it('returns empty string if no key or id exists', function () {
    var doc = new Documents.Doc({
      key: null,
      value: 'the-value'
    }, opts);

    assert.equal(store.getDocId(doc), '');

  });
});

describe('isEditable', function () {
  store = new Stores.IndexResultsStore();

  it('returns false for no collection', function () {
    store._collection = null;
    assert.notOk(store.isEditable());
  });

  it('returns false for empty collection', function () {
    store._collection = [];
    assert.notOk(store.isEditable());
  });

  it('delegates to collection', function () {
    store._collection = {
      attributes: {
        fields: ["foo"]
      }
    };
    store._collection.isEditable = function () { return {'stub': true}; };
    assert.deepEqual(store.isEditable(), {'stub': true});
    store._collection = {};
  });

  it('retuns false for ghost-docs that are filtered away', function () {
    store._collection = {};
    assert.equal(store.isEditable({}), false);
  });
});

describe('isDeletable', function () {
  store = new Stores.IndexResultsStore();

  it('retuns false for ghost-docs that are filtered away', function () {
    assert.equal(store.isDeletable({}), false);
  });
});

describe('Index Pagination', function () {

  beforeEach(function () {
    store = new Stores.IndexResultsStore();
    dispatchToken = FauxtonAPI.dispatcher.register(store.dispatch);
  });

  afterEach(function () {
    FauxtonAPI.dispatcher.unregister(dispatchToken);
  });

  describe('#collectionChanged', function () {
    var collection;
    beforeEach(function () {
      collection = new Documents.AllDocs([{id:1}, {id: 2}], {
        params: {},
        database: {
          safeID: function () { return '1';}
        }
      });
      store.reset();
      store.newResults({
        collection: collection
      });
    });

    it('sets total rows correctly', function () {
      assert.equal(store.getTotalRows(), 2);
    });
  });

  describe('canShowPrevious', function () {
    it('cannot show previous if disabled', function () {
      store._enabled = false;
      assert.notOk(store.canShowPrevious());
    });

    it('can show if collection can show', function () {
      store._enabled = true;
      store._collection = new Backbone.Collection();
      store._collection.hasPrevious = function () { return true;};
      assert.ok(store.canShowPrevious());
    });

  });

  describe('canShowNext', function () {
    it('cannot show next if disabled', function () {
      store._enabled = false;
      assert.notOk(store.canShowNext());
    });

    it('cannot show if pageStart and perPage greater than docLimit', function () {
      store._enabled = true;
      store._docLimit = 10;
      store._perPage = 20;

      assert.notOk(store.canShowNext());
    });

    it('can show if collection can show', function () {
      store._enabled = true;
      store._docLimit = 100000;
      store.reset();
      store._collection = new Backbone.Collection();
      store._collection.hasNext = function () { return true;};
      assert.ok(store.canShowNext());
    });
  });

  describe('paginateNext', function () {
    beforeEach(function () {
      store.reset();

      store.newResults({
        collection: new Documents.AllDocs(null, {
          params: {},
          database: {
            safeID: function () { return '1';}
          }
        })
      });
      store.setPerPage(20);
    });

    it('should increment page number', function () {
      store.paginateNext();

      assert.equal(store.getCurrentPage(), 2);
    });

    it('should increment page start', function () {
      store.paginateNext();

      assert.equal(store.getPageStart(), 21);
    });

    it('should set correct page end', function () {
      store._collection.length = 20;
      store.paginateNext();

      assert.equal(store.getPageEnd(), 40);
    });

    it('should set collection pageSize', function () {
      store.paginateNext();

      assert.equal(store.getCollection().paging.pageSize, 20);
    });
  });

  describe('paginatePrevious', function () {
    beforeEach(function () {
      store.resetPagination();
      store._collection = new Documents.AllDocs(null, {
        params: {},
        database: {
          safeID: function () { return '1';}
        }
      });
    });

    it('should decrement page number', function () {
      store.paginateNext();
      store.paginatePrevious();

      assert.equal(store.getCurrentPage(), 1);
    });

    it('should decrement page start', function () {
      store.paginateNext();
      store.paginatePrevious();

      assert.equal(store.getPageStart(), 1);
    });

    it('should decrement page end', function () {
      store._collection.length = 20;
      store.paginateNext();
      store.paginatePrevious();

      assert.equal(store.getPageEnd(), 20);
    });

    it('should set collection pageSize', function () {
      store.paginateNext();
      store.paginatePrevious();

      assert.equal(store.getCollection().paging.pageSize, 20);
    });

  });

  describe('totalDocsViewed', function () {
    beforeEach(function () {
      store.reset();
    });

    it('returns correct count for page 1 and 20 docs per page', function () {
      assert.equal(store.totalDocsViewed(), 20);
    });

    it('returns correct count for page 3 and 10 docs per page', function () {
      store._perPage = 10;
      store._currentPage = 3;

      assert.equal(store.totalDocsViewed(), 30);
    });
  });

  describe('documentsLeftToFetch', function () {
    beforeEach(function () {
      store.reset();
    });

    it('returns 20 documents left', function () {
      assert.equal(store.documentsLeftToFetch(), 20);
    });

    it('returns less if close to limit', function () {
      store._docLimit = 35;
      store._perPage = 10;
      store._currentPage = 3;
      assert.equal(store.documentsLeftToFetch(), 5);
    });

  });

  describe('#initPerPage', function () {

    it('uses default if no local storage set', function () {
      window.localStorage.removeItem('fauxton:perpage');
      store.initPerPage();
      assert.equal(store.getPerPage(), 20);
    });

    it('uses localstorage when available', function () {
      window.localStorage.setItem('fauxton:perpage', 44);
      store.initPerPage();
      assert.equal(store.getPerPage(), 44);
    });

    it('uses doc limit when its less than perPage', function () {
      window.localStorage.setItem('fauxton:perpage', 100);
      store._docLimit = 6;
      store.initPerPage();
      assert.equal(store.getPerPage(), 6);
    });

  });

  describe('#setDocumentLimit', function () {

    it('sets document if exists', function () {
      store.setDocumentLimit(10);
      assert.equal(store._docLimit, 10);
    });

    it('sets perPage to doclimit if doclimit less than perPage', function () {
      store.setPerPage(20);
      store.setDocumentLimit(1);
      assert.equal(store._docLimit, 1);
    });

    it('sets doclimit to 10000 if NaN', function () {
      store.setDocumentLimit(NaN);
      assert.equal(store._docLimit, 10000);
    });
  });

  describe('#setPerPage', function () {
    beforeEach(function () {
      store.reset();
      store._collection = new Documents.AllDocs(null, {
        params: {},
        database: {
          safeID: function () { return '1';}
        }
      });

    });

    it('stores per page in local storage', function () {
      var testPerPage = 111;
      store.setPerPage(testPerPage);
      var perPage = window.localStorage.getItem('fauxton:perpage');
      assert.equal(perPage, testPerPage);
    });

    it('sets collections perPage', function () {
      var spy = sinon.spy(store._collection, 'pageSizeReset');
      var testPerPage = 110;

      store.setPerPage(testPerPage);
      assert.equal(spy.getCall(0).args[0], testPerPage);


    });
  });
});
