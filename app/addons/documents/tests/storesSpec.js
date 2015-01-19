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
  'addons/documents/stores',
  'addons/documents/actiontypes',
  'addons/documents/resources',
  'testUtils'
], function (FauxtonAPI, Stores, ActionTypes, Documents, testUtils) {
  var assert = testUtils.assert;
  var store;
  var dispatchToken;


  describe('IndexEditorStore', function () {

    beforeEach(function () {
      store = new Stores.IndexEditorStore();
      dispatchToken = FauxtonAPI.dispatcher.register(store.dispatch);
    });

    afterEach(function () {
      FauxtonAPI.dispatcher.unregister(dispatchToken);
    });

    describe('TOGGLE EDITOR', function () {

      it('toggles editor', function () {
        var designDoc = {
          _id: '_design/test-doc',
          views: {
            'test-view': {
              map: 'boom'
            }
          }
        };

        var designDocs = new Documents.AllDocs([designDoc], {
          params: { limit: 10 },
          database: {
            safeID: function () { return 'id';}
          }
        });

        FauxtonAPI.dispatch({
          type: ActionTypes.EDIT_NEW_INDEX,
          options: {
            newView: false,
            designDocs: designDocs,
            designDocId: '_design/test-doc'
          }
        });


        FauxtonAPI.dispatch({
          type: ActionTypes.TOGGLE_EDITOR
        });

        assert.ok(store.showEditor());
      });

    });

    describe('map editor', function () {

      describe('new view', function () {

        beforeEach(function () {

          FauxtonAPI.dispatch({
            type: ActionTypes.EDIT_NEW_INDEX,
            options: {
              newView: true
            }
          });
        });

        it('returns default map', function () {
          assert.equal(store.getMap(), 'function(doc) {\n  emit(doc._id, 1);\n}');
        });

        it('Edit Index as title', function () {
          assert.equal(store.getTitle(), 'Create Index');
        });
      });

    });

    describe('reduce editor', function () {

      describe('has custom reduce', function () {

        it('is false for no reduce', function () {
          var designDoc = {
            _id: '_design/test-doc',
            views: {
              'test-view': {
                map: 'function () {};'
              }
            }
          };

          var designDocs = new Documents.AllDocs([designDoc], {
            params: { limit: 10 },
            database: {
              safeID: function () { return 'id';}
            }
          });

          FauxtonAPI.dispatch({
            type: ActionTypes.EDIT_NEW_INDEX,
            options: {
              newView: false,
              viewName: 'test-view',
              designDocs: designDocs,
              designDocId: designDoc._id
            }
          });

          assert.notOk(store.hasCustomReduce());
        });

        it('is false for built in reduce', function () {
          var designDoc = {
            _id: '_design/test-doc',
            views: {
              'test-view': {
                map: 'function () {};',
                reduce: '_sum'
              }
            }
          };

          var designDocs = new Documents.AllDocs([designDoc], {
            params: { limit: 10 },
            database: {
              safeID: function () { return 'id';}
            }
          });
          FauxtonAPI.dispatch({
            type: ActionTypes.EDIT_NEW_INDEX,
            options: {
              newView: false,
              viewName: 'test-view',
              designDocs: designDocs,
              designDocId: designDoc._id
            }
          });

          assert.notOk(store.hasCustomReduce());
        });

        it('is true for custom reduce', function () {
          var designDoc = {
            _id: '_design/test-doc',
            views: {
              'test-view': {
                map: 'function () {};',
                reduce: 'function (reduce) { reduce(); }'
              }
            }
          };

          var designDocs = new Documents.AllDocs([designDoc], {
            params: { limit: 10 },
            database: {
              safeID: function () { return 'id';}
            }
          });

          FauxtonAPI.dispatch({
            type: ActionTypes.EDIT_NEW_INDEX,
            options: {
              newView: false,
              viewName: 'test-view',
              designDocs: designDocs,
              designDocId: designDoc._id
            }
          });

          assert.ok(store.hasCustomReduce());
        });

      });

      //show default reduce
      describe('SELECT_REDUCE_CHANGE', function () {

        beforeEach(function () {
          var designDoc = {
            _id: '_design/test-doc',
            views: {
              'test-view': {
                map: 'function () {};'
              }
            }
          };

          var designDocs = new Documents.AllDocs([designDoc], {
            params: { limit: 10 },
            database: {
              safeID: function () { return 'id';}
            }
          });

          FauxtonAPI.dispatch({
            type: ActionTypes.EDIT_NEW_INDEX,
            options: {
              newView: false,
              viewName: 'test-view',
              designDocs: designDocs,
              designDocId: designDoc._id
            }
          });
        });

        it('NONE returns null reduce', function () {
          FauxtonAPI.dispatch({
            type: ActionTypes.SELECT_REDUCE_CHANGE,
            reduceSelectedOption: 'NONE'
          });
          assert.ok(_.isNull(store.getReduce()));
        });

        it('builtin returns bultin reduce', function () {
          FauxtonAPI.dispatch({
            type: ActionTypes.SELECT_REDUCE_CHANGE,
            reduceSelectedOption: '_sum'
          });
          assert.equal(store.getReduce(), '_sum');
        });

        it('custom returns custom reduce', function () {
          FauxtonAPI.dispatch({
            type: ActionTypes.SELECT_REDUCE_CHANGE,
            reduceSelectedOption: 'CUSTOM'
          });
          assert.equal(store.getReduce(), 'function(keys, values, rereduce){\n  if (rereduce){\n    return sum(values);\n  } else {\n    return values.length;\n  }\n}');
        });
      });
    });


    describe('design doc selector', function () {
      var designDoc;

      beforeEach(function () {
        designDoc = {
          _id: '_design/test-doc',
          views: {
            'test-view': {
              map: 'boom'
            }
          }
        };

        var designDocs = new Documents.AllDocs([designDoc], {
          params: { limit: 10 },
          database: {
            safeID: function () { return 'id';}
          }
        });

        FauxtonAPI.dispatch({
          type: ActionTypes.EDIT_INDEX,
          options: {
            newView: false,
            viewName: 'test-view',
            designDocs: designDocs,
            designDocId: designDoc._id
          }
        });
      });

      it('DESIGN_DOC_CHANGE changes design doc id', function () {
        var designDocId =  'another-one';
        FauxtonAPI.dispatch({
          type: ActionTypes.DESIGN_DOC_CHANGE,
          designDocId: designDocId,
          newDesignDoc: false
        });

        assert.equal(store.getDesignDocId(), designDocId);
        assert.notOk(store.isNewDesignDoc());
      });

      it('sets new design doc on NEW_DESIGN_DOC', function () {
        FauxtonAPI.dispatch({
          type: ActionTypes.NEW_DESIGN_DOC
        });

        assert.ok(store.isNewDesignDoc());
        assert.equal(store.getDesignDocId(), '');
      });
    });

    describe('EDIT_INDEX', function () {
      var designDoc, designDocs;

      beforeEach(function () {
        designDoc = {
          _id: '_design/test-doc',
          views: {
            'test-view': {
              map: 'boom'
            }
          }
        };

        designDocs = new Documents.AllDocs([designDoc], {
          params: { limit: 10 },
          database: {
            safeID: function () { return 'id';}
          }
        });

      });

      it('can set reduce for new design doc', function () {
        FauxtonAPI.dispatch({
          type: ActionTypes.EDIT_INDEX,
          options: {
            newView: true,
            newDesignDoc: true,
            viewName: 'test-view',
            designDocs: designDocs,
            designDocId: undefined
          }
        });

        FauxtonAPI.dispatch({
          type: ActionTypes.SELECT_REDUCE_CHANGE,
          reduceSelectedOption: '_sum'
        });

        assert.equal(store.getReduce(), '_sum');
      });

      it('showEditor() is false for editing index', function () {
        FauxtonAPI.dispatch({
          type: ActionTypes.EDIT_INDEX,
          options: {
            newView: false,
            viewName: 'test-view',
            designDocs: designDocs,
            designDocId: designDoc._id
          }
        });

        assert.notOk(store.showEditor());
      });

      it('showEditor() is true for creating index', function () {
        FauxtonAPI.dispatch({
          type: ActionTypes.EDIT_INDEX,
          options: {
            newView: true,
            viewName: 'test-view',
            newDesignDoc: false,
            designDocs: designDocs,
            designDocId: designDoc._id
          }
        });

        assert.ok(store.showEditor());
      });

    });

  });
});

