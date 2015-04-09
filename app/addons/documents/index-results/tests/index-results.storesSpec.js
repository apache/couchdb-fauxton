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

  describe('Index Results Store', function () {

    beforeEach(function () {
      store = new Stores.IndexResultsStore();
      dispatchToken = FauxtonAPI.dispatcher.register(store.dispatch);
    });

    describe('#hasResults', function () {

      it('returns true for collection', function () {
        store._collection = [1, 2, 3];

        assert.ok(store.hasResults());
      });

      it('returns false for empty collection', function () {
        store._collection = [];

        assert.notOk(store.hasResults());
      });

    });

    describe('#getResults', function () {

      it('has correct doc format', function () {
        store._collection = new Documents.AllDocs([{_id: 'testId'}], {
          params: {},
          database: {
            safeID: function () { return '1';}
          }
        });

        var doc = store.getResults()[0];
        assert.equal(doc.id, 'testId');
        assert.equal(doc.keylabel, 'id');
      });

    });

    afterEach(function () {
      FauxtonAPI.dispatcher.unregister(dispatchToken);
    });
  });

  describe('canSelectAll', function () {

    it('returns true for selected docs less than collection', function () {
      store._collection = new Documents.AllDocs([{_id: 'testId1'}, {_id: 'testId2'}], {
        params: {},
        database: {
          safeID: function () { return '1';}
        }
      });

      store._selectedItems = {'testId1': true};
      assert.ok(store.canSelectAll());
    });

    it('returns false for selected docs same as collection', function () {
      store._collection = new Documents.AllDocs([{_id: 'testId1'}, {_id: 'testId2'}], {
        params: {},
        database: {
          safeID: function () { return '1';}
        }
      });

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

  describe('canCollapseDocs', function () {

    it('returns true for no collapsed docs', function () {
      store._collapsedDocs = {};
      assert.ok(store.canCollapseDocs());
    });

    it('returns false for all collapsed docs', function () {
      store._collection = new Documents.AllDocs([{_id: 'testId1'}, {_id: 'testId2'}], {
        params: {},
        database: {
          safeID: function () { return '1';}
        }
      });

      store._collapsedDocs = {
        'testId1': true,
        'testId2': true
      };

      assert.notOk(store.canCollapseDocs());
    });

  });

  describe('canUncollapseDocs', function () {

    it('returns true for collapsed docs', function () {
      store._collapsedDocs = {'testId1': true};
      assert.ok(store.canUncollapseDocs());
    });

    it('returns false for no collapsed docs', function () {
      store.clearCollapsedDocs();

      assert.notOk(store.canUncollapseDocs());
    });

  });

  describe('getDocContent', function () {

    it('returns full doc if not collapsed', function () {
      store._collection = new Documents.AllDocs([{_id: 'testId1', 'value': 'one'}] , {
        params: {},
        database: {
          safeID: function () { return '1';}
        }
      });

      var doc = store._collection.first();
      var result = store.getDocContent(doc);

      assert.equal(JSON.parse(result).value, 'one');
    });

    it('returns no doc content if collapsed', function () {
      store._collection = new Documents.AllDocs([{_id: 'testId1', 'value': 'one'}] , {
        params: {},
        database: {
          safeID: function () { return '1';}
        }
      });

      var doc = store._collection.first();
      store._collapsedDocs = {'testId1': true};
      var result = store.getDocContent(doc);

      assert.equal('', result);
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
      store._collection = new Documents.AllDocs([{_id: 'testId1', 'value': 'one'}] , {
        params: {},
        database: {
          safeID: function () { return '1';}
        }
      });

      store.selectAllDocuments();
      assert.ok(store.getSelectedItems().testId1);
    });

  });

  describe('#deSelectAllDocuments', function () {

    it('deselects all documents', function () {
      store._collection = new Documents.AllDocs([{_id: 'testId1', 'value': 'one'}] , {
        params: {},
        database: {
          safeID: function () { return '1';}
        }
      });

      store.selectAllDocuments();
      assert.ok(store.getSelectedItems().testId1);
      store.deSelectAllDocuments();
      assert.equal(store.getSelectedItemsLength(), 0);
    });
  });

  describe('#collapseSelectedDocs', function () {

    it('collapses all selected docs', function () {
      store._collection = new Documents.AllDocs([{_id: 'testId1'}, {_id: 'testId2'}], {
        params: {},
        database: {
          safeID: function () { return '1';}
        }
      });

      store.clearCollapsedDocs();

      store._selectedItems = {
        'testId1': true,
        'testId2': true
      };

      store.collapseSelectedDocs();
      assert.equal(store.getCollapsedDocsLength(), 2);
    });

  });

  describe('#unCollapseSelectedDocs', function () {

    it('uncollapses all selected docs', function () {
      store._collection = new Documents.AllDocs([{_id: 'testId1'}, {_id: 'testId2'}], {
        params: {},
        database: {
          safeID: function () { return '1';}
        }
      });

      store.clearCollapsedDocs();

      store._selectedItems = {
        'testId1': true,
        'testId2': true
      };

      store.collapseSelectedDocs();
      assert.equal(store.getCollapsedDocsLength(), 2);
      store.unCollapseSelectedDocs();
      assert.equal(store.getCollapsedDocsLength(), 0);
    });
  });

  describe('#createBulkDeleteFromSelected', function () {

    it('correctly creates BulkDeleteDocCollection', function () {
      store._collection = new Documents.AllDocs([{_id: 'testId1'}, {_id: 'testId2'}], {
        params: {},
        database: {
          safeID: function () { return '1';}
        }
      });

      store._selectedItems = {
        'testId1': true,
        'testId2': true
      };

      var bulkDelete = store.createBulkDeleteFromSelected();

      assert.equal(bulkDelete.length, 2);
      assert.ok(bulkDelete.at(0).get('_deleted'));
    });

  });

  describe('#getDocId', function () {

    it('returns id if it exists', function () {
      var doc = new Documents.Doc({
        _id: 'doc-id'
      }, {
        database: {
          safeID: function () { return '1';}
        }
      });

      assert.equal(store.getDocId(doc), 'doc-id');

    });

    it('returns key if it exists', function () {
      var doc = new Documents.Doc({
        key: 'doc-key'
      }, {
        database: {
          safeID: function () { return '1';}
        }
      });

      assert.equal(store.getDocId(doc), 'doc-key');

    });

    it('returns empty string if no key or id exists', function () {
      var doc = new Documents.Doc({
        key: null,
        value: 'the-value'
      }, {
        database: {
          safeID: function () { return '1';}
        }
      });

      assert.equal(store.getDocId(doc), '');

    });
  });

  describe('isEditable', function () {

    it('returns false for no collection', function () {
      store._collection = null;
      assert.notOk(store.isEditable());
    });

    it('returns false for empty collection', function () {
      store._collection = [];
      assert.notOk(store.isEditable());
    });

    it('delegates to collection', function () {
      store._collection = {};
      store._collection.isEditable = function () { return 'stub'; };
      assert.equal(store.isEditable(), 'stub');
    });
  });
});
