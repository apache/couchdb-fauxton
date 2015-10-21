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

define([
  'api',
  'addons/documents/index-results/stores',
  'addons/documents/index-results/actiontypes',
  'addons/documents/shared-resources',
  'testUtils'
], function (FauxtonAPI, Stores, ActionTypes, Documents, testUtils) {
  var assert = testUtils.assert;
  var dispatchToken;
  var store;
  var opts;

  describe('Index Results Store', function () {
    beforeEach(function () {
      store = new Stores.IndexResultsStore();
      dispatchToken = FauxtonAPI.dispatcher.register(store.dispatch);
      store.reset();
      opts = {
        params: {limit: 10, skip: 0},
        database: {
          safeID: function () { return '1';}
        }
      };
    });

    afterEach(function () {
      FauxtonAPI.dispatcher.unregister(dispatchToken);
    });


    it('hasResults returns true for collection', function () {
      store._collection = [1, 2, 3];

      assert.ok(store.hasResults());
    });

    it('hasResults returns false for empty collection', function () {
      store._collection = [];

      assert.notOk(store.hasResults());
    });

    it('getResults has correct doc format', function () {
      store._collection = new Documents.AllDocs([{_id: 'testId'}], opts);

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

    it('normalizes different content from include_docs disabled', function () {
      var doclist = [
        {id: 'testId2', foo: 'one'},
        {id: 'testId3', foo: 'two'}
      ];

      var res = store.normalizeTableData(doclist);
      assert.deepEqual(doclist, res);
    });

    it('finds out if we have at least one editable/deleteable doc which needs an id', function () {
      var doclist = [
        {id: 'testId2', foo: 'one'},
        {id: 'testId3', foo: 'two'}
      ];

      assert.ok(store.getHasEditableAndDeletableDoc(doclist));

      doclist = [
        {foo: 'one'},
        {foo: 'two'}
      ];

      assert.notOk(store.getHasEditableAndDeletableDoc(doclist));
    });

  });

  describe('canSelectAll', function () {

    it('returns true for selected docs less than collection', function () {
      store._collection = new Documents.AllDocs([{_id: 'testId1'}, {_id: 'testId2'}], opts);

      store._selectedItems = {'testId1': true};
      assert.ok(store.canSelectAll());
    });

    it('returns false for selected docs same as collection', function () {
      store._collection = new Documents.AllDocs([{_id: 'testId1'}, {_id: 'testId2'}], opts);

      store._selectedItems = {
        'testId1': true,
        'testId2': true
      };

      assert.notOk(store.canSelectAll());
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

      assert.notOk(store.canSelectAll());
    });
  });

  describe('canDeselectAll', function () {

    it('returns true for selected docs', function () {
      store._selectedItems = {'testId1': true};
      assert.ok(store.canDeselectAll());
    });

    it('returns false for no selected docs', function () {
      store._selectedItems = {};

      assert.notOk(store.canDeselectAll());
    });

  });

  describe('getDocContent', function () {

    it('returns full doc if not collapsed', function () {
      store._collection = new Documents.AllDocs([{_id: 'testId1', 'value': 'one'}], opts);

      var doc = store._collection.first();
      var result = store.getDocContent(doc);

      assert.equal(JSON.parse(result).value, 'one');
    });

    it('returns just the revision as content if collapsed', function () {
      store._collection = new Documents.AllDocs([{_id: 'testId1', _rev: 'a', 'value': 'one'}], opts);

      var doc = store._collection.first();
      store._allCollapsed = true;
      var result = store.getDocContent(doc);

      assert.deepEqual({"rev": "a"}, JSON.parse(result));
    });

  });

  describe('#selectDoc', function () {

    it('selects doc if not already selected', function () {
      store._selectedItems = {};
      store.selectDoc('id');
      assert.equal(store.getSelectedItemsLength(), 1);
    });

    it('deselects doc if already selected', function () {
      store._selectedItems = {'id': true};
      store.selectDoc('id');
      assert.equal(store.getSelectedItemsLength(), 0);
    });
  });

  describe('#selectAllDocuments', function () {

    it('selects all documents', function () {
      store._collection = new Documents.AllDocs([{_id: 'testId1', 'value': 'one'}], opts);

      store.selectAllDocuments();
      assert.ok(store.getSelectedItems().testId1);
    });

  });

  describe('toggleSelectAllDocuments', function () {

    it('deselects all documents', function () {
      store._collection = new Documents.AllDocs([{_id: 'testId1', 'value': 'one'}], opts);

      store.selectAllDocuments();
      assert.ok(store.getSelectedItems().testId1);
      store.toggleSelectAllDocuments();
      assert.equal(store.getSelectedItemsLength(), 0);
    });

    it('deselects all documents', function () {
      store.reset();
      store._collection = new Documents.AllDocs([{_id: 'testId1', 'value': 'one'}], opts);

      assert.equal(Object.keys(store.getSelectedItems()).length, 0);
      store.toggleSelectAllDocuments();
      assert.equal(store.getSelectedItemsLength(), 1);
    });
  });

  describe('#createBulkDeleteFromSelected', function () {

    it('correctly creates BulkDeleteDocCollection', function () {
      store._collection = new Documents.AllDocs([{_id: 'testId1'}, {_id: 'testId2'}], opts);

      store._bulkDeleteDocCollection = Documents.BulkDeleteDocCollection;

      store._selectedItems = {
        'testId1': true,
        'testId2': true
      };

      var bulkDelete = store.createBulkDeleteFromSelected();

      assert.equal(bulkDelete.length, 2);
      assert.ok(bulkDelete.at(0).get('_deleted'));
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
});
