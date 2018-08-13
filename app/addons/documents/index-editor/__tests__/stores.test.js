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
import Documents from "../../../documents/resources";
import testUtils from "../../../../../test/mocha/testUtils";
import '../../base';
const assert = testUtils.assert;
let store;
let dispatchToken;

describe('IndexEditorStore', () => {

  beforeEach(() => {
    store = new Stores.IndexEditorStore();
    dispatchToken = FauxtonAPI.dispatcher.register(store.dispatch.bind(store));
  });

  afterEach(() => {
    FauxtonAPI.dispatcher.unregister(dispatchToken);
  });

  describe('map editor', () => {

    describe('new view', () => {

      beforeEach(() => {
        FauxtonAPI.dispatch({
          type: ActionTypes.EDIT_NEW_INDEX,
          options: {
            newView: true
          }
        });
      });

      it('returns default map', () => {
        assert.equal(store.getMap(), 'function (doc) {\n  emit(doc._id, 1);\n}');
      });
    });

  });

  describe('reduce editor', () => {
    describe('has custom reduce', () => {
      it('is false for no reduce', () => {
        const designDoc = {
          _id: '_design/test-doc',
          views: {
            'test-view': {
              map: '() => {};'
            }
          }
        };

        const designDocs = new Documents.AllDocs([designDoc], {
          params: { limit: 10 },
          database: {
            safeID: () => { return 'id';}
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

      it('is false for built in reduce', () => {
        const designDoc = {
          _id: '_design/test-doc',
          views: {
            'test-view': {
              map: '() => {};',
              reduce: '_sum'
            }
          }
        };

        const designDocs = new Documents.AllDocs([designDoc], {
          params: { limit: 10 },
          database: {
            safeID: () => { return 'id';}
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

      it('is true for custom reduce', () => {
        const designDoc = {
          _id: '_design/test-doc',
          views: {
            'test-view': {
              map: '() => {};',
              reduce: 'function (reduce) { reduce(); }'
            }
          }
        };

        const designDocs = new Documents.AllDocs([designDoc], {
          params: { limit: 10 },
          database: {
            safeID: () => { return 'id';}
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
    describe('SELECT_REDUCE_CHANGE', () => {

      beforeEach(() => {
        const designDoc = {
          _id: '_design/test-doc',
          views: {
            'test-view': {
              map: '() => {};'
            }
          }
        };

        const designDocs = new Documents.AllDocs([designDoc], {
          params: { limit: 10 },
          database: {
            safeID: () => { return 'id';}
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

      it('NONE returns null reduce', () => {
        FauxtonAPI.dispatch({
          type: ActionTypes.SELECT_REDUCE_CHANGE,
          reduceSelectedOption: 'NONE'
        });
        assert.ok(_.isNull(store.getReduce()));
      });

      it('builtin returns bultin reduce', () => {
        FauxtonAPI.dispatch({
          type: ActionTypes.SELECT_REDUCE_CHANGE,
          reduceSelectedOption: '_sum'
        });
        assert.equal(store.getReduce(), '_sum');
      });

      it('custom returns custom reduce', () => {
        FauxtonAPI.dispatch({
          type: ActionTypes.SELECT_REDUCE_CHANGE,
          reduceSelectedOption: 'CUSTOM'
        });
        assert.equal(store.getReduce(), 'function (keys, values, rereduce) {\n  if (rereduce) {\n    return sum(values);\n  } else {\n    return values.length;\n  }\n}');
      });
    });
  });


  describe('design doc selector', () => {
    let designDoc;

    beforeEach(() => {
      designDoc = {
        _id: '_design/test-doc',
        views: {
          'test-view': {
            map: 'boom'
          }
        }
      };

      const mangoDoc = {
        "_id": "_design/123mango",
        "id": "_design/123mango",
        "key": "_design/123mango",
        "value": {
          "rev": "20-9e4bc8b76fd7d752d620bbe6e0ea9a80"
        },
        "doc": {
          "_id": "_design/123mango",
          "_rev": "20-9e4bc8b76fd7d752d620bbe6e0ea9a80",
          "views": {
            "test-view": {
              "map": "function(doc) {\n  emit(doc._id, 2);\n}"
            },
            "new-view": {
              "map": "function(doc) {\n  if (doc.class === \"mammal\" && doc.diet === \"herbivore\")\n    emit(doc._id, 1);\n}",
              "reduce": "_sum"
            }
          },
          "language": "query",
          "indexes": {
            "newSearch": {
              "analyzer": "standard",
              "index": "function(doc){\n index(\"default\", doc._id);\n}"
            }
          }
        }
      };

      const designDocArray = _.map([designDoc, mangoDoc], (doc) => {
        return Documents.Doc.prototype.parse(doc);
      });

      var designDocs = new Documents.AllDocs(designDocArray, {
        params: { limit: 10 },
        database: {
          safeID: () => { return 'id'; }
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

    afterEach(() => {
      store.reset();
    });

    it('DESIGN_DOC_CHANGE changes design doc id', () => {
      const designDocId = 'another-one';
      FauxtonAPI.dispatch({
        type: ActionTypes.DESIGN_DOC_CHANGE,
        options: {
          value: designDocId
        }
      });
      assert.equal(store.getDesignDocId(), designDocId);
    });

    it('only filters mango docs', () => {
      const designDocs = store.getAvailableDesignDocs();
      assert.equal(designDocs.length, 1);
      assert.equal(designDocs[0], '_design/test-doc');
    });
  });

  describe('EDIT_INDEX', () => {
    let designDoc, designDocs;

    beforeEach(() => {
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
          safeID: () => { return 'id';}
        }
      });

    });

    it('can set reduce for new design doc', () => {
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

  });

});
