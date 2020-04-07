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

import reducer from '../reducers';
import ActionTypes from '../actiontypes';
import Constants from '../constants';

describe('Search Reducer', () => {

  it('adds an analyzer row', () => {
    const action = {
      type: ActionTypes.SEARCH_INDEX_ADD_ANALYZER_ROW,
      options: {
        analyzer: 'sample',
        fieldName: 'f1'
      }
    };
    let newState = reducer(undefined, { type: 'DO_NOTHING' });
    expect(newState.analyzerFields).toHaveLength(0);
    newState = reducer(newState, action);
    expect(newState.analyzerFields).toHaveLength(1);
    expect(newState.analyzerFields[0].analyzer).toBe('sample');
    expect(newState.analyzerFields[0].valid).toBe(true);
  });

  it('updates field name of an existing row', () => {
    const action = {
      type: ActionTypes.SEARCH_INDEX_ADD_ANALYZER_ROW,
      options: {
        analyzer: 'sample',
        fieldName: 'f1'
      }
    };
    let newState = reducer(undefined, action);
    action.options.fieldName = 'f2';
    newState = reducer(newState, action);
    action.options.fieldName = 'f3';
    newState = reducer(newState, action);

    const removeAction = {
      type: ActionTypes.SEARCH_INDEX_SET_ANALYZER_ROW_FIELD_NAME,
      options: { rowIndex: 1, fieldName: 'f100' }
    };
    newState = reducer(newState, removeAction);
    expect(newState.analyzerFields[0].fieldName).toBe('f1');
    expect(newState.analyzerFields[1].fieldName).toBe('f100');
    expect(newState.analyzerFields[2].fieldName).toBe('f3');
  });

  it('updates analyzer of an existing row', () => {
    const action = {
      type: ActionTypes.SEARCH_INDEX_ADD_ANALYZER_ROW,
      options: {
        analyzer: 'sample',
        fieldName: 'f1'
      }
    };
    let newState = reducer(undefined, action);
    action.options.fieldName = 'f2';
    newState = reducer(newState, action);
    action.options.fieldName = 'f3';
    newState = reducer(newState, action);

    const removeAction = {
      type: ActionTypes.SEARCH_INDEX_SET_ANALYZER_ROW,
      options: { rowIndex: 1, analyzer: 'keyword' }
    };
    newState = reducer(newState, removeAction);
    expect(newState.analyzerFields[0].analyzer).toBe('sample');
    expect(newState.analyzerFields[1].analyzer).toBe('keyword');
    expect(newState.analyzerFields[2].analyzer).toBe('sample');
  });

  it('removes an analyzer row', () => {
    const action = {
      type: ActionTypes.SEARCH_INDEX_ADD_ANALYZER_ROW,
      options: {
        analyzer: 'sample',
        fieldName: 'f1'
      }
    };
    let newState = reducer(undefined, action);
    action.options.fieldName = 'f2';
    newState = reducer(newState, action);
    action.options.fieldName = 'f3';
    newState = reducer(newState, action);

    const removeAction = {
      type: ActionTypes.SEARCH_INDEX_REMOVE_ANALYZER_ROW,
      options: { rowIndex: 1 }
    };
    newState = reducer(newState, removeAction);
    expect(newState.analyzerFields).toHaveLength(2);
    expect(newState.analyzerFields[0].fieldName).toBe('f1');
    expect(newState.analyzerFields[1].fieldName).toBe('f3');
  });

  it('updates search results and resets the hasActiveQuery flag', () => {
    let newState = reducer(undefined, {
      type: ActionTypes.SEARCH_INDEX_PREVIEW_REQUEST_MADE
    });
    expect(newState.hasActiveQuery).toBe(true);

    const action = {
      type: ActionTypes.SEARCH_INDEX_PREVIEW_MODEL_UPDATED,
      options: {
        searchResults: ['result1', 'result2']
      }
    };
    newState = reducer(newState, action);
    expect(newState.searchResults).toHaveLength(2);
    expect(newState.hasActiveQuery).toBe(false);
  });

  it('resets the search results when the search term is empty', () => {
    const action = {
      type: ActionTypes.SEARCH_INDEX_PREVIEW_MODEL_UPDATED,
      options: {
        searchResults: ['result1', 'result2']
      }
    };
    let newState = reducer(undefined, action);
    expect(newState.searchResults).toHaveLength(2);

    const initAction = {
      type: ActionTypes.SEARCH_INDEX_INIT,
      options: {
        searchQuery: ''
      }
    };
    newState = reducer(newState, initAction);
    expect(newState.searchResults).toBeUndefined();
  });

  it('loads the single analyzer correctly', () => {
    const initialState = reducer(undefined, { type: 'DO_NOTHING' });
    expect(initialState.singleAnalyzer).toBe('standard');

    const ddocID = '_design/ddoc_test';
    const mockDesigDocModel = {
      id: ddocID,
      dDocModel: () => { return mockDesigDocModel; },
      getAnalyzer: () => 'keyword',
      getIndex: () => '',
      analyzerType: () => Constants.ANALYZER_SINGLE
    };
    const designDocs = [mockDesigDocModel];
    const action = {
      type: ActionTypes.SEARCH_INDEX_INIT_EDIT_SEARCH_INDEX,
      options: {
        database: 'db1',
        designDocs,
        ddocID,
        indexName: 'idx1'
      }
    };
    // Validate the single analyzer is correct
    const stateWithKeywordAnalyzer = reducer(initialState, action);
    expect(stateWithKeywordAnalyzer.singleAnalyzer).toBe('keyword');

    // Validate the default analyzer is set when the DDoc doesn't specify one
    mockDesigDocModel.getAnalyzer = () => undefined;
    const stateWithNoAnalyzer = reducer(initialState, action);
    expect(stateWithNoAnalyzer.singleAnalyzer).toBe(Constants.DEFAULT_ANALYZER);
  });

});
