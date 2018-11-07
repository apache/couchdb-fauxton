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

import Documents from '../../../documents/resources';
import reducer, { hasCustomReduce, getDesignDocIds } from '../reducers';
import ActionTypes from '../actiontypes';
import '../../base';

describe('IndexEditor Reducer', () => {
  describe('map editor', () => {
    it('new view is assigned the default map code', () => {
      const action = {
        type: ActionTypes.EDIT_NEW_INDEX,
        options: {
          isNewView: true,
          //designDocs: {find: () => { return { dDocModel: () => {}}; }}
        }
      };
      const newState = reducer(undefined, action);
      expect(newState.view.map).toBe('function (doc) {\n  emit(doc._id, 1);\n}');
    });
  });

  describe('reduce editor', () => {
    describe('hasCustomReduce', () => {
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
        const action = {
          type: ActionTypes.EDIT_NEW_INDEX,
          options: {
            isNewView: false,
            viewName: 'test-view',
            designDocs: designDocs,
            designDocId: designDoc._id
          }
        };
        const newState = reducer(undefined, action);
        expect(hasCustomReduce(newState)).toBe(false);
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
        const action = {
          type: ActionTypes.EDIT_NEW_INDEX,
          options: {
            isNewView: false,
            viewName: 'test-view',
            designDocs: designDocs,
            designDocId: designDoc._id
          }
        };
        const newState = reducer(undefined, action);
        expect(hasCustomReduce(newState)).toBe(false);
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
        const action = {
          type: ActionTypes.EDIT_NEW_INDEX,
          options: {
            isNewView: false,
            viewName: 'test-view',
            designDocs: designDocs,
            designDocId: designDoc._id
          }
        };

        const newState = reducer(undefined, action);
        expect(hasCustomReduce(newState)).toBe(true);
      });
    });

    describe('SELECT_REDUCE_CHANGE', () => {
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
      const editAction = {
        type: ActionTypes.EDIT_NEW_INDEX,
        options: {
          isNewView: false,
          viewName: 'test-view',
          designDocs: designDocs,
          designDocId: designDoc._id
        }
      };

      it('NONE returns null reduce', () => {
        let newState = reducer(undefined, editAction);
        const selectReduceaction = {
          type: ActionTypes.SELECT_REDUCE_CHANGE,
          reduceSelectedOption: 'NONE'
        };
        newState = reducer(newState, selectReduceaction);
        expect(newState.view.reduce).toBe('');
      });

      it('builtin returns builtin reduce', () => {
        let newState = reducer(undefined, editAction);
        const selectReduceAction = {
          type: ActionTypes.SELECT_REDUCE_CHANGE,
          reduceSelectedOption: '_sum'
        };
        newState = reducer(newState, selectReduceAction);
        expect(newState.view.reduce).toBe('_sum');
      });

      it('custom returns custom reduce', () => {
        let newState = reducer(undefined, editAction);
        const selectReduceAction = {
          type: ActionTypes.SELECT_REDUCE_CHANGE,
          reduceSelectedOption: 'CUSTOM'
        };
        newState = reducer(newState, selectReduceAction);
        expect(newState.view.reduce).toBe('function (keys, values, rereduce) {\n  if (rereduce) {\n    return sum(values);\n  } else {\n    return values.length;\n  }\n}');
      });
    });
  });

  describe('design doc selector', () => {
    const designDoc = {
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

    const designDocs = new Documents.AllDocs(designDocArray, {
      params: { limit: 10 },
      database: {
        safeID: () => { return 'id'; }
      }
    });

    const editAction = {
      type: ActionTypes.EDIT_INDEX,
      options: {
        isNewView: false,
        viewName: 'test-view',
        designDocs: designDocs,
        designDocId: designDoc._id
      }
    };

    it('DESIGN_DOC_CHANGE changes design doc id', () => {
      let newState = reducer(undefined, editAction);
      const designDocId = 'another-one';
      const ddocChangeAction = {
        type: ActionTypes.DESIGN_DOC_CHANGE,
        options: {
          value: designDocId
        }
      };
      newState = reducer(newState, ddocChangeAction);
      expect(newState.designDocId).toBe(designDocId);
    });

    it('only filters mango docs', () => {
      const newState = reducer(undefined, editAction);
      const designDocs = getDesignDocIds(newState);

      expect(designDocs.length).toBe(1);
      expect(designDocs[0]).toBe('_design/test-doc');
    });
  });

  describe('EDIT_INDEX', () => {
    const designDoc = {
      _id: '_design/test-doc',
      views: {
        'test-view': {
          map: 'boom'
        }
      }
    };
    const designDocs = new Documents.AllDocs([designDoc], {
      params: { limit: 10 },
      database: {
        safeID: () => { return 'id';}
      }
    });

    it('can set reduce for new design doc', () => {
      const editAction = {
        type: ActionTypes.EDIT_INDEX,
        options: {
          isNewView: true,
          isNewDesignDoc: true,
          viewName: 'test-view',
          designDocs: designDocs,
          designDocId: undefined
        }
      };
      let newState = reducer(undefined, editAction);

      const selectReduceAction = {
        type: ActionTypes.SELECT_REDUCE_CHANGE,
        reduceSelectedOption: '_sum'
      };
      newState = reducer(newState, selectReduceAction);
      expect(newState.view.reduce).toBe('_sum');
    });
  });
});
