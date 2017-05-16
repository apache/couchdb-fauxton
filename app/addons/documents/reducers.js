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

import FauxtonAPI from '../../core/api';
import ActionTypes from './index-results/actiontypes';
import Constants from './constants';
import { getJsonViewData } from './index-results/helpers/json-view';
import { getTableViewData } from './index-results/helpers/table-view';

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
  typeOfIndex: 'view',
  queryParams: {
    docParams: {  // params fauxton uses to fetch results from couch
      limit: FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE + 1
    },
    urlParams: {  // params representing what is visible to the user
      limit: FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE
    }
  },
  pagination: {
    pageStart: 1,  // index of first doc in this page of results
    currentPage: 1,  // what page of results are we showing?
    perPage: FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE,
    canShowNext: false  // flag indicating if we can show a next page
  }
};

export default function resultsState (state = initialState, action) {
  switch (action.type) {

    case ActionTypes.INDEX_RESULTS_REDUX_RESET_STATE:
      return Object.assign({}, initialState, {
        // deeply assign these values to ensure they're reset
        queryParams: {
          docParams: {
            limit: FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE + 1
          },
          urlParams: {
            limit: FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE
          }
        }
      });
    break;

    case ActionTypes.INDEX_RESULTS_REDUX_INITIALIZE:
      return Object.assign({}, state, {
        queryParams: action.params
      });
    break;

    case ActionTypes.INDEX_RESULTS_REDUX_IS_LOADING:
      return Object.assign({}, state, {
        isLoading: true
      });
    break;

    case ActionTypes.INDEX_RESULTS_REDUX_NEW_SELECTED_DOCS:
      return Object.assign({}, state, {
        selectedDocs: action.selectedDocs
      });
    break;

    case ActionTypes.INDEX_RESULTS_REDUX_NEW_RESULTS:
      return Object.assign({}, state, {
        docs: removeOverflowDoc(action.docs, state.pagination.perPage),
        isLoading: false,
        isEditable: true, //TODO: determine logic for this
        queryParams: Object.assign({}, state.queryParams, {
          docParams: action.params
        }),
        pagination: Object.assign({}, state.pagination, {
          canShowNext: action.docs.length > state.pagination.perPage
        })
      });
    break;

    case ActionTypes.INDEX_RESULTS_REDUX_CHANGE_LAYOUT:
      return Object.assign({}, state, {
        selectedLayout: action.layout
      });
    break;

    case ActionTypes.INDEX_RESULTS_REDUX_TOGGLE_SHOW_ALL_COLUMNS:
      return Object.assign({}, state, {
        tableView: Object.assign({}, state.tableView, {
          showAllFieldsTableView: !state.tableView.showAllFieldsTableView,
          cachedFieldsTableView: state.tableView.selectedFieldsTableView
        })
      });
    break;

    case ActionTypes.INDEX_RESULTS_REDUX_CHANGE_TABLE_HEADER_ATTRIBUTE:
      return Object.assign({}, state, {
        tableView: Object.assign({}, state.tableView, {
          selectedFieldsTableView: action.selectedFieldsTableView
        })
      });
    break;

    case ActionTypes.INDEX_RESULTS_REDUX_SET_PER_PAGE:
      return Object.assign({}, state, {
        pagination: Object.assign({}, state.pagination, {
          perPage: action.perPage,
          currentPage: 1,
          pageStart: 1
        })
      });
    break;

    case ActionTypes.INDEX_RESULTS_REDUX_PAGINATE_NEXT:
      return Object.assign({}, state, {
        pagination: Object.assign({}, state.pagination, {
          pageStart: state.pagination.pageStart + state.pagination.perPage,
          currentPage: state.pagination.currentPage + 1
        })
      });
    break;

    case ActionTypes.INDEX_RESULTS_REDUX_PAGINATE_PREVIOUS:
      return Object.assign({}, state, {
        pagination: Object.assign({}, state.pagination, {
          pageStart: state.pagination.pageStart - state.pagination.perPage,
          currentPage: state.pagination.currentPage - 1
        })
      });
    break;

    default:
      return state;
  }
};


// fauxton always requests one extra doc as a sneaky way to determine if
// there is another page of results.  We need to remove that extra doc so
// we don't confuse users.
const removeOverflowDoc = (docs, limit) => {
  return docs.length <= limit ? docs : docs.slice(0, limit);
};

// we don't want to muddy the waters with autogenerated mango docs
const removeGeneratedMangoDocs = (doc) => {
  return doc.language !== 'query';
};

// transform the docs in to a state ready for rendering on the page
export const getDataForRendering = (state, databaseName) => {
  const { docs } = state;
  const options = {
    databaseName: databaseName,
    selectedLayout: state.selectedLayout,
    selectedFieldsTableView: state.tableView.selectedFieldsTableView,
    showAllFieldsTableView: state.tableView.showAllFieldsTableView,
    typeOfIndex: state.typeOfIndex
  };

  const docsWithoutGeneratedMangoDocs = docs.filter(removeGeneratedMangoDocs);

  if (Constants.LAYOUT_ORIENTATION.JSON === options.selectedLayout) {
    return getJsonViewData(docsWithoutGeneratedMangoDocs, options);
  } else {
    return getTableViewData(docsWithoutGeneratedMangoDocs, options);
  }
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

// helper function to determine if all the docs on the current page are selected.
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

    // Helper function for finding index of a doc in the current
    // selected docs list.
    const exists = (selectedDoc) => {
      return doc._id || doc.id === selectedDoc._id;
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

export const getDisplayedFields = (state, databaseName)  => {
  return getDataForRendering(state, databaseName).displayedFields || {};
};

// Here be simple getters
export const getDocs = state => state.docs;
export const getSelectedDocs = state => state.selectedDocs;
export const getIsLoading = state => state.isLoading;
export const getIsEditable = state => state.isEditable;
export const getSelectedLayout = state => state.selectedLayout;
export const getTextEmptyIndex = state => state.textEmptyIndex;
export const getTypeOfIndex = state => state.typeOfIndex;
export const getQueryParams = state => state.queryParams;
export const getPageStart = state => state.pagination.pageStart;
export const getPrioritizedEnabled = state => state.tableView.showAllFieldsTableView;
export const getPerPage = state => state.pagination.perPage;
export const getCanShowNext = state => state.pagination.canShowNext;
