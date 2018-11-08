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

import app from "../../../app";
import ActionTypes from './actiontypes';
import Constants from '../constants';
import {getJsonViewData} from './helpers/json-view';
import {getTableViewData} from './helpers/table-view';
import {getDefaultPerPage, getDocId, isJSONDocBulkDeletable} from './helpers/shared-helpers';

const initialState = {
  noResultsWarning: '',
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
  resultsStyle: loadStyle(),
  fetchParams: {
    limit: getDefaultPerPage() + 1,
    skip: 0
  },
  pagination: {
    pageStart: 1,  // index of first doc in this page of results
    currentPage: 1,  // what page of results are we showing?
    perPage: getDefaultPerPage(),
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
    showReduce: false,
    stable: false,
    update: 'true'
  }
};

function loadStyle() {
  let style = app.utils.localStorageGet('fauxton:results_style');
  if (!style) {
    style = {
      textOverflow: Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_TRUNCATED,
      fontSize: Constants.INDEX_RESULTS_STYLE.FONT_SIZE_MEDIUM
    };
  }
  return style;
}

function storeStyle(style) {
  app.utils.localStorageSet('fauxton:results_style', style);
}

export default function resultsState(state = initialState, action) {
  switch (action.type) {

    case ActionTypes.INDEX_RESULTS_SET_STYLE:
      const newStyle = {
        ...state.resultsStyle,
        ...action.resultsStyle
      };
      storeStyle(newStyle);
      return {
        ...state,
        resultsStyle: newStyle
      };

    case ActionTypes.INDEX_RESULTS_REDUX_RESET_STATE:
      return {
        ...initialState,
        noResultsWarning: state.noResultsWarning,
        selectedLayout: state.selectedLayout,
        selectedDocs: [],
        fetchParams: {
          limit: getDefaultPerPage() + 1,
          skip: 0
        },
        pagination: Object.assign({}, initialState.pagination, {
          perPage: state.pagination.perPage
        }),
        queryOptionsPanel: Object.assign({}, initialState.queryOptionsPanel,
          state.queryOptionsPanel, {reduce: false, groupLevel: 'exact', showReduce: false}),
        isLoading: false,
        resultsStyle: state.resultsStyle
      };

    case ActionTypes.INDEX_RESULTS_REDUX_IS_LOADING:
      return {
        ...state,
        isLoading: true
      };

    case ActionTypes.INDEX_RESULTS_REDUX_PARTITION_PARAM_NOT_SUPPORTED:
      return Object.assign({}, state, {
        noResultsWarning: 'The selected index does not support partitions. Switch back to global mode.'
      });

    case ActionTypes.INDEX_RESULTS_REDUX_PARTITION_PARAM_MANDATORY:
      return Object.assign({}, state, {
        noResultsWarning: 'The selected index requires a partition key. Use the selector at the top to enter a partition key.'
      });

    case ActionTypes.INDEX_RESULTS_REDUX_NEW_SELECTED_DOCS:
      return {
        ...state,
        selectedDocs: action.selectedDocs
      };

    case ActionTypes.INDEX_RESULTS_REDUX_NEW_RESULTS:
      let selectedLayout = state.selectedLayout;
      // Change layout if it's set to METADATA because this option is not available for Mango queries
      if (action.docType === Constants.INDEX_RESULTS_DOC_TYPE.MANGO_QUERY) {
        if (state.selectedLayout === Constants.LAYOUT_ORIENTATION.METADATA) {
          selectedLayout = Constants.LAYOUT_ORIENTATION.TABLE;
        }
      }
      return {
        ...state,
        docs: action.docs,
        isLoading: false,
        noResultsWarning: '',
        isEditable: true, //TODO: determine logic for this
        fetchParams: Object.assign({}, state.fetchParams, action.params),
        pagination: Object.assign({}, state.pagination, {
          canShowNext: action.canShowNext
        }),
        docType: action.docType,
        selectedLayout: selectedLayout,
        executionStats: action.executionStats,
        warning: action.warning
      };

    case ActionTypes.INDEX_RESULTS_REDUX_CHANGE_LAYOUT:
      return {
        ...state,
        selectedLayout: action.layout
      };

    case ActionTypes.INDEX_RESULTS_REDUX_TOGGLE_SHOW_ALL_COLUMNS:
      return {
        ...state,
        tableView: Object.assign({}, state.tableView, {
          showAllFieldsTableView: !state.tableView.showAllFieldsTableView,
          cachedFieldsTableView: state.tableView.selectedFieldsTableView
        })
      };

    case ActionTypes.INDEX_RESULTS_REDUX_CHANGE_TABLE_HEADER_ATTRIBUTE:
      return {
        ...state,
        tableView: Object.assign({}, state.tableView, {
          selectedFieldsTableView: action.selectedFieldsTableView
        })
      };

    case ActionTypes.INDEX_RESULTS_REDUX_SET_PER_PAGE:
      app.utils.localStorageSet('fauxton:perpageredux', action.perPage);
      return {
        ...state,
        pagination: Object.assign({}, initialState.pagination, {
          perPage: action.perPage
        })
      };

    case ActionTypes.INDEX_RESULTS_REDUX_PAGINATE_NEXT:
      return {
        ...state,
        pagination: Object.assign({}, state.pagination, {
          pageStart: state.pagination.pageStart + state.pagination.perPage,
          currentPage: state.pagination.currentPage + 1
        })
      };

    case ActionTypes.INDEX_RESULTS_REDUX_PAGINATE_PREVIOUS:
      return {
        ...state,
        pagination: Object.assign({}, state.pagination, {
          pageStart: state.pagination.pageStart - state.pagination.perPage,
          currentPage: state.pagination.currentPage - 1
        })
      };

    case ActionTypes.INDEX_RESULTS_REDUX_NEW_QUERY_OPTIONS:
      // includeDocs or reduce should be mutually exclusive
      if (action.options.includeDocs && action.options.reduce) {
        // includeDocs has precedence if both are set at the same time
        action.options.reduce = false;
      } else if (action.options.includeDocs && state.queryOptionsPanel.reduce) {
        // Switch off reduce when includeDocs is being set to true
        action.options.reduce = false;
      } else if (action.options.reduce && state.queryOptionsPanel.includeDocs) {
        // Switch off includeDocs when reduce is being set to true
        action.options.includeDocs = false;
      }
      return {
        ...state,
        queryOptionsPanel: Object.assign({}, state.queryOptionsPanel, action.options)
      };

    default:
      return state;
  }
}

// we don't want to muddy the waters with autogenerated mango docs
export const removeGeneratedMangoDocs = (doc) => {
  return doc.language !== 'query';
};

// transform the docs in to a state ready for rendering on the page
export const getDataForRendering = (state, databaseName, deleteEnabled = true) => {
  const {docs} = state;
  const options = {
    databaseName: databaseName,
    selectedLayout: state.selectedLayout,
    selectedFieldsTableView: state.tableView.selectedFieldsTableView,
    showAllFieldsTableView: state.tableView.showAllFieldsTableView,
    docType: state.docType,
    deleteEnabled: deleteEnabled
  };

  const docsWithoutGeneratedMangoDocs = docs.filter(removeGeneratedMangoDocs);

  if (Constants.LAYOUT_ORIENTATION.JSON === options.selectedLayout) {
    return getJsonViewData(docsWithoutGeneratedMangoDocs, options);
  }
  return getTableViewData(docsWithoutGeneratedMangoDocs, options);

};

// Should we show the input checkbox where the user can elect to display
// all possible columns in the table view?
export const getShowPrioritizedEnabled = (state) => {
  return state.selectedLayout === Constants.LAYOUT_ORIENTATION.TABLE;
};

// returns the index of the last result in the total possible results.
export const getPageEnd = (state) => {
  if (!getHasResults(state)) {
    return false;
  }
  return state.pagination.pageStart + state.docs.length - 1;
};

// do we have any docs in the state tree currently?
export const getHasResults = (state) => {
  return !state.isLoading && state.docs.length > 0;
};

// helper function to determine if all selectable docs on the current page are selected.
export const getAllDocsSelected = (state) => {
  if (state.docs.length === 0 || state.selectedDocs.length === 0) {
    return false;
  }

  // Iterate over the results and determine if each one is included
  // in the selectedDocs array.
  //
  // This is O(n^2) which makes me unhappy.  We know
  // that the number of docs will never be that large due to the
  // per page limitations we force on the user.
  //
  // We need to use a for loop here instead of a forEach since there
  // is no way to short circuit Array.prototype.forEach.

  for (let i = 0; i < state.docs.length; i++) {
    const doc = state.docs[i];
    if (!isJSONDocBulkDeletable(doc, state.docType)) {
      //Only check selectable docs
      continue;
    }
    // Helper function for finding index of a doc in the current
    // selected docs list.
    const exists = (selectedDoc) => {
      return getDocId(doc, state.docType) === selectedDoc._id;
    };

    if (!state.selectedDocs.some(exists)) {
      return false;
    }
  }
  return true;
};

// are there any documents selected in the state tree?
export const getHasDocsSelected = (state) => {
  return state.selectedDocs.length > 0;
};

// how many documents are selected in the state tree?
export const getNumDocsSelected = (state) => {
  return state.selectedDocs.length;
};

// is there a previous page of results?  We only care if the current page
// of results is greater than 1 (i.e. the first page of results).
export const getCanShowPrevious = (state) => {
  return state.pagination.currentPage > 1;
};

export const getDisplayedFields = (state, databaseName) => {
  return getDataForRendering(state, databaseName).displayedFields || {};
};

export const getQueryOptionsParams = (state) => {
  const {queryOptionsPanel} = state;
  const params = {};

  if (queryOptionsPanel.includeDocs) {
    params.include_docs = queryOptionsPanel.includeDocs;
  }

  if (queryOptionsPanel.showBetweenKeys) {
    const betweenKeys = queryOptionsPanel.betweenKeys;
    params.inclusive_end = betweenKeys.include;
    if (betweenKeys.startkey && betweenKeys.startkey != '') {
      params.start_key = betweenKeys.startkey;
    }
    if (betweenKeys.endkey && betweenKeys.endkey != '') {
      params.end_key = betweenKeys.endkey;
    }
  } else if (queryOptionsPanel.showByKeys) {
    if (queryOptionsPanel.byKeys.trim()) {
      params.keys = queryOptionsPanel.byKeys.replace(/\r?\n/g, '');
    }
  }

  if (queryOptionsPanel.limit !== 'none') {
    params.limit = parseInt(queryOptionsPanel.limit, 10);
  }

  if (queryOptionsPanel.skip) {
    params.skip = parseInt(queryOptionsPanel.skip, 10);
  }

  if (queryOptionsPanel.descending) {
    params.descending = queryOptionsPanel.descending;
  }

  if (queryOptionsPanel.reduce) {
    params.reduce = true;

    if (queryOptionsPanel.groupLevel === 'exact') {
      params.group = true;
    } else {
      params.group_level = queryOptionsPanel.groupLevel;
    }
  }

  // Only add UPDATE and STABLE parameters when different than
  // their respective default values. This prevent errors in
  // older CouchDB versions that don't support these parameters.
  if (queryOptionsPanel.update !== undefined && queryOptionsPanel.update !== 'true') {
    params.update = queryOptionsPanel.update;
  }
  if (queryOptionsPanel.stable === true) {
    params.stable = queryOptionsPanel.stable;
  }

  return params;
};

// Here be simple getters
export const getDocs = state => state.docs;
export const getSelectedDocs = state => state.selectedDocs;
export const getIsLoading = state => state.isLoading;
export const getIsEditable = state => state.isEditable;
export const getSelectedLayout = state => state.selectedLayout;
export const getTextEmptyIndex = state => state.textEmptyIndex;
export const getDocType = state => state.docType;
export const getPageStart = state => state.pagination.pageStart;
export const getPrioritizedEnabled = state => state.tableView.showAllFieldsTableView;
export const getCanShowNext = state => state.pagination.canShowNext;
export const getQueryOptionsPanel = state => state.queryOptionsPanel;
export const getPerPage = state => state.pagination.perPage;
export const getFetchParams = state => state.fetchParams;
export const getResultsStyle = state => state.resultsStyle;
