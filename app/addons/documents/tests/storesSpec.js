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
  var expect = testUtils.chai.expect;
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

        expect(store.showEditor()).to.be.true;
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
          expect(store.getMap()).to.equal( 'function(doc) {\n  emit(doc._id, 1);\n}');
        });

        it('Edit Index as title', function () {
          expect(store.getTitle()).to.equal('Create Index');
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

          expect(store.hasCustomReduce()).to.be.false;
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

          expect(store.hasCustomReduce()).to.be.false;
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

          expect(store.hasCustomReduce()).to.be.true;
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
          expect(store.getReduce()).to.be.null;
        });

        it('builtin returns bultin reduce', function () {
          FauxtonAPI.dispatch({
            type: ActionTypes.SELECT_REDUCE_CHANGE,
            reduceSelectedOption: '_sum'
          });
          expect(store.getReduce()).to.equal('_sum');
        });

        it('custom returns custom reduce', function () {
          FauxtonAPI.dispatch({
            type: ActionTypes.SELECT_REDUCE_CHANGE,
            reduceSelectedOption: 'CUSTOM'
          });
          expect(store.getReduce()).to.equal( 'function(keys, values, rereduce){\n  if (rereduce){\n    return sum(values);\n  } else {\n    return values.length;\n  }\n}');
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

        expect(store.getDesignDocId()).to.equal(designDocId);
        expect(store.isNewDesignDoc()).to.false;
      });

      it('sets new design doc on NEW_DESIGN_DOC', function () {
        FauxtonAPI.dispatch({
          type: ActionTypes.NEW_DESIGN_DOC
        });

        expect(store.isNewDesignDoc()).to.true;
        expect(store.getDesignDocId()).to.equal('');
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

        expect(store.getReduce()).to.equal('_sum');
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

        expect(store.showEditor()).to.be.false;
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

        expect(store.showEditor()).to.be.true;
      });

    });

  });
});

