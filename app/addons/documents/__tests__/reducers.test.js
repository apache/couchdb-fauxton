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

import * as Reducers from '../index-results/reducers';
import FauxtonAPI from '../../../core/api';
import Constants from '../constants';
import ActionTypes from '../index-results/actiontypes';

describe('Docs Reducers', () => {
  const initialState = {
    docs: [],  // raw documents returned from couch
    selectedDocs: [],  // documents selected for manipulation
    isLoading: false,
    tableView: {
      selectedFieldsTableView: [],  // current columns to display
      showAllFieldsTableView: false, // do we show all possible columns?
    },
    isEditable: true,  // can the user manipulate the results returned?
    selectedLayout: Constants.LAYOUT_ORIENTATION.METADATA,
    textEmptyIndex: 'No Documents Found',
    docType: Constants.INDEX_RESULTS_DOC_TYPE.VIEW,
    fetchParams: {
      limit: FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE + 1,
      skip: 0
    },
    pagination: {
      pageStart: 1,  // index of first doc in this page of results
      currentPage: 1,  // what page of results are we showing?
      perPage: FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE,
      canShowNext: false  // flag indicating if we can show a next page
    },
    queryOptionsPanel: {
      isVisible: false,
      showByKeys: false,
      showBetweenKeys: false,
      includeDocs: false,
      betweenKeys: {
        include: true,
        startkey: '',
        endkey: ''
      },
      byKeys: '',
      descending: false,
      skip: '',
      limit: 'none',
      reduce: false,
      groupLevel: 'exact',
      showReduce: false
    }
  };
  const testDoc = {
    id: 'foo',
    key: 'foo',
    value: {
      rev: '1-967a00dff5e02add41819138abb3284d'
    }
  };

  it('resets selectedDocs on state reset', () => {
    const action = {
      type: ActionTypes.INDEX_RESULTS_REDUX_NEW_SELECTED_DOCS,
      selectedDocs: [{_id: '1'}]
    };

    const newState = Reducers.default(initialState, action);

    const resetAction = {
      type: ActionTypes.INDEX_RESULTS_REDUX_RESET_STATE
    };

    const newState2 = Reducers.default(newState, resetAction);
    expect(newState2.selectedDocs).toEqual([]);

  });

  it('getDocs returns the docs attribute from the state', () => {
    const action = {
      type: ActionTypes.INDEX_RESULTS_REDUX_NEW_RESULTS,
      docs: [testDoc],
      fetchPArams: {
        limit: 21,
        skip: 0
      },
      canShowNext: true
    };

    const newState = Reducers.default(initialState, action);
    expect(Reducers.getDocs(newState)).toEqual([testDoc]);
  });

  it('getSelected returns the selectedDocs attribute from the state', () => {
    const selectedDoc = {
      _id: 'foo',
      _rev: '1-967a00dff5e02add41819138abb3284d',
      _deleted: true
    };
    const action = {
      type: ActionTypes.INDEX_RESULTS_REDUX_NEW_SELECTED_DOCS,
      selectedDocs: [selectedDoc]
    };

    const newState = Reducers.default(initialState, action);
    expect(Reducers.getSelectedDocs(newState)).toEqual([selectedDoc]);
  });

  it('getIsLoading returns the isLoading attribute from the state', () => {
    expect(Reducers.getIsLoading(initialState)).toBe(false);
  });

  it('getIsEditable returns the isEditable attribute from the state', () => {
    expect(Reducers.getIsEditable(initialState)).toBe(true);
  });

  it('getSelectedLayout returns the selectedLayout attribute from the state', () => {
    expect(Reducers.getSelectedLayout(initialState)).toMatch(Constants.LAYOUT_ORIENTATION.METADATA);
  });

  it('getTextEmptyIndex returns the textEmptyIndex attribute from the state', () => {
    expect(Reducers.getTextEmptyIndex(initialState)).toMatch('No Documents Found');
  });

  it('getDocType returns the docType attribute from the state', () => {
    expect(Reducers.getDocType(initialState)).toMatch(Constants.INDEX_RESULTS_DOC_TYPE.VIEW);
  });

  it('getFetchParams returns the fetchParams attribute from the state', () => {
    expect(Reducers.getFetchParams(initialState)).toEqual({
      limit: FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE + 1,
      skip: 0
    });
  });

  it('getPageStart returns the pageStart attribute from the state', () => {
    expect(Reducers.getPageStart(initialState)).toBe(1);
  });

  it('getPrioritizedEnabled returns the showAllFieldsTableView attribute from the state', () => {
    expect(Reducers.getPrioritizedEnabled(initialState)).toBe(false);
  });

  it('getPerPage returns the perPage attribute from the state', () => {
    expect(Reducers.getPerPage(initialState)).toBe(FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE);
  });

  it('getCanShowNext returns the canShowNext attribute from the state', () => {
    expect(Reducers.getCanShowNext(initialState)).toBe(false);
  });

  it('getQueryOptionsPanel returns the queryOptionsPanel attribute from the state', () => {
    expect(Reducers.getQueryOptionsPanel(initialState)).toEqual({
      isVisible: false,
      showByKeys: false,
      showBetweenKeys: false,
      includeDocs: false,
      betweenKeys: {
        include: true,
        startkey: '',
        endkey: ''
      },
      byKeys: '',
      descending: false,
      skip: '',
      limit: 'none',
      reduce: false,
      groupLevel: 'exact',
      showReduce: false
    });
  });

  describe('removeGeneratedMangoDocs', () => {
    it('returns false when language is query', () => {
      expect(Reducers.removeGeneratedMangoDocs({ language: 'query' })).toBe(false);
    });

    it('returns true when language is not query', () => {
      expect(Reducers.removeGeneratedMangoDocs({ language: 'foo' })).toBe(true);
    });
  });

  describe('getShowPrioritizedEnabled', () => {
    it('returns false when not table layout', () => {
      expect(Reducers.getShowPrioritizedEnabled(initialState)).toBe(false);
    });

    it('returns true when table layout', () => {
      const action = {
        type: ActionTypes.INDEX_RESULTS_REDUX_CHANGE_LAYOUT,
        layout: Constants.LAYOUT_ORIENTATION.TABLE
      };

      const newState = Reducers.default(initialState, action);
      expect(Reducers.getShowPrioritizedEnabled(newState)).toBe(true);
    });
  });

  describe('getPageEnd', () => {
    it('returns false when there are no results', () => {
      expect(Reducers.getPageEnd(initialState)).toBe(false);
    });

    it('returns pageStart + results.length - 1 when there are results', () => {
      const action = {
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_RESULTS,
        docs: [testDoc],
        fetchPArams: {
          limit: 21,
          skip: 0
        },
        canShowNext: true
      };

      const newState = Reducers.default(initialState, action);
      expect(Reducers.getPageEnd(newState)).toBe(1);
    });
  });

  describe('getHasResults', () => {
    it('returns false when state is loading', () => {
      const action = {
        type: ActionTypes.INDEX_RESULTS_REDUX_IS_LOADING
      };

      const newState = Reducers.default(initialState, action);
      expect(Reducers.getHasResults(newState)).toBe(false);
    });

    it('returns false when docs.length is zero', () => {
      expect(Reducers.getHasResults(initialState)).toBe(false);
    });

    it('returns true when not loading and there are results', () => {
      const action = {
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_RESULTS,
        docs: [testDoc],
        fetchPArams: {
          limit: 21,
          skip: 0
        },
        canShowNext: true
      };

      const newState = Reducers.default(initialState, action);
      expect(Reducers.getHasResults(newState)).toBe(true);
    });
  });

  describe('getAllDocsSelected', () => {
    it('returns false if docs.length is zero', () => {
      expect(Reducers.getAllDocsSelected(initialState)).toBe(false);
    });

    it('returns false if docs but selectedDocs.length is zero', () => {
      const selectedDoc = {
        _id: 'foo',
        _rev: '1-967a00dff5e02add41819138abb3284d',
        _deleted: true
      };
      const action = {
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_SELECTED_DOCS,
        selectedDocs: [selectedDoc]
      };

      const newState = Reducers.default(initialState, action);
      expect(Reducers.getAllDocsSelected(newState)).toBe(false);
    });

    it('returns false there is a doc not in the selectedDocs array', () => {
      const action = {
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_RESULTS,
        docs: [testDoc],
        fetchPArams: {
          limit: 21,
          skip: 0
        },
        canShowNext: true
      };

      const newState = Reducers.default(initialState, action);
      expect(Reducers.getAllDocsSelected(newState)).toBe(false);
    });

    it('returns true when all selectable docs in the docs array are in the selectedDocs array', () => {
      const newDocAction = {
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_RESULTS,
        docs: [testDoc],
        fetchPArams: {
          limit: 21,
          skip: 0
        },
        canShowNext: true,
        docType: Constants.INDEX_RESULTS_DOC_TYPE.VIEW
      };

      const newState1 = Reducers.default(initialState, newDocAction);
      const selectedDoc = {
        _id: 'foo',
        _rev: '1-967a00dff5e02add41819138abb3284d',
        _deleted: true
      };
      const newSelectedDocAction = {
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_SELECTED_DOCS,
        selectedDocs: [selectedDoc]
      };
      const newState2 = Reducers.default(newState1, newSelectedDocAction);
      expect(Reducers.getAllDocsSelected(newState2)).toBe(true);
    });
  });

  describe('getHasDocsSelected', () => {
    it('returns false when there are no docs in the selectedDocs array', () => {
      expect(Reducers.getHasDocsSelected(initialState)).toBe(false);
    });

    it('returns true when there are docs in the selectedDocs array', () => {
      const selectedDoc = {
        _id: 'foo',
        _rev: '1-967a00dff5e02add41819138abb3284d',
        _deleted: true
      };
      const action = {
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_SELECTED_DOCS,
        selectedDocs: [selectedDoc]
      };

      const newState = Reducers.default(initialState, action);
      expect(Reducers.getHasDocsSelected(newState)).toBe(true);
    });
  });

  it('getNumDocsSelected returns the length of the selectedDocs array', () => {
    expect(Reducers.getNumDocsSelected(initialState)).toBe(0);
  });

  describe('canShowPrevious', () => {
    it('returns false when the current page is 1', () => {
      expect(Reducers.getCanShowPrevious(initialState)).toBe(false);
    });

    it('returns true when the current page is greater than 1', () => {
      const action = {
        type: ActionTypes.INDEX_RESULTS_REDUX_PAGINATE_NEXT
      };

      const newState = Reducers.default(initialState, action);
      expect(Reducers.getCanShowPrevious(newState)).toBe(true);
    });
  });

  describe('getQueryOptionsParams', () => {
    it('returns an empty object by default', () => {
      expect(Reducers.getQueryOptionsParams(initialState)).toEqual({});
    });

    it('adds include_docs when set in queryOptionsPanel', () => {
      const action = {
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_QUERY_OPTIONS,
        options: {
          includeDocs: true
        }
      };

      const newState = Reducers.default(initialState, action);
      expect(Reducers.getQueryOptionsParams(newState)).toEqual({
        include_docs: true
      });
    });

    it('adds start_key, end_key, and inclusive end when set in queryOptionsPanel', () => {
      const action = {
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_QUERY_OPTIONS,
        options: {
          showBetweenKeys: true,
          betweenKeys: {
            include: true,
            startkey: '"_design"',
            endkey: '"_design0"'
          }
        }
      };

      const newState = Reducers.default(initialState, action);
      expect(Reducers.getQueryOptionsParams(newState)).toEqual({
        inclusive_end: true,
        start_key: '"_design"',
        end_key: '"_design0"'
      });
    });

    it('adds keys if showByKeys is set in queryOptionsPanel', () => {
      const action = {
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_QUERY_OPTIONS,
        options: {
          showByKeys: true,
          byKeys: "['_design', 'foo']"
        }
      };

      const newState = Reducers.default(initialState, action);
      expect(Reducers.getQueryOptionsParams(newState)).toEqual({
        keys: "['_design', 'foo']"
      });
    });

    it('adds limit if limit is set in the queryOptionsPanel', () => {
      const action = {
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_QUERY_OPTIONS,
        options: {
          limit: 50
        }
      };

      const newState = Reducers.default(initialState, action);
      expect(Reducers.getQueryOptionsParams(newState)).toEqual({
        limit: 50
      });
    });

    it('adds skip if skip is set in the queryOptionsPanel', () => {
      const action = {
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_QUERY_OPTIONS,
        options: {
          skip: 5
        }
      };

      const newState = Reducers.default(initialState, action);
      expect(Reducers.getQueryOptionsParams(newState)).toEqual({
        skip: 5
      });
    });

    it('adds descending if descending is set in the queryOptionsPanel', () => {
      const action = {
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_QUERY_OPTIONS,
        options: {
          descending: true
        }
      };

      const newState = Reducers.default(initialState, action);
      expect(Reducers.getQueryOptionsParams(newState)).toEqual({
        descending: true
      });
    });

    it('adds reduce if reduce is set in the queryOptionsPanel', () => {
      const action = {
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_QUERY_OPTIONS,
        options: {
          reduce: true
        }
      };

      const newState = Reducers.default(initialState, action);
      expect(Reducers.getQueryOptionsParams(newState)).toEqual({
        reduce: true,
        group: true
      });
    });

    it('adds reduce and group_level if both are set in queryOptionsPanel', () => {
      const action = {
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_QUERY_OPTIONS,
        options: {
          reduce: true,
          groupLevel: 2
        }
      };

      const newState = Reducers.default(initialState, action);
      expect(Reducers.getQueryOptionsParams(newState)).toEqual({
        reduce: true,
        group_level: 2
      });
    });

    it('only adds update when set to non-default value in the queryOptionsPanel', () => {
      const action = {
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_QUERY_OPTIONS,
        options: {
          update: 'lazy'
        }
      };

      const newStateLazy = Reducers.default(initialState, action);
      expect(Reducers.getQueryOptionsParams(newStateLazy)).toEqual({
        update: 'lazy'
      });

      action.options.update = 'false';
      const newStateFalse = Reducers.default(initialState, action);
      expect(Reducers.getQueryOptionsParams(newStateFalse)).toEqual({
        update: 'false'
      });

      action.options.update = 'true';
      const newStateTrue = Reducers.default(initialState, action);
      expect(Reducers.getQueryOptionsParams(newStateTrue)).toEqual({
        update: undefined
      });
    });

    it('only adds stable when set to non-default value in the queryOptionsPanel', () => {
      const action = {
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_QUERY_OPTIONS,
        options: {
          stable: true
        }
      };

      const newStateTrue = Reducers.default(initialState, action);
      expect(Reducers.getQueryOptionsParams(newStateTrue)).toEqual({
        stable: true
      });

      action.options.stable = false;
      const newStateFalse = Reducers.default(initialState, action);
      expect(Reducers.getQueryOptionsParams(newStateFalse)).toEqual({
        stable: undefined
      });
    });
  });
});
