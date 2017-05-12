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

import ActionTypes from './index-results/actiontypes';
import Constants from './constants';
import { getJsonViewData } from './index-results/helpers/json-view';
import { getTableViewData } from './index-results/helpers/table-view';

const initialState = {
  docs: [],
  selectedDocs: [],
  isLoading: false,
  dataForRendering: {},
  tableView: {
    selectedFieldsTableView: [],
    showAllFieldsTableView: false,
    cachedFieldsTableView: []
  },
  isEditable: true,
  selectedLayout: Constants.LAYOUT_ORIENTATION.METADATA,
  textEmptyIndex: 'No Documents Found',
  typeOfIndex: 'view',
  queryParams: {}
};

const removeGeneratedMangoDocs = (doc) => {
  return doc.language !== 'query';
};

const buildDataForRendering = (docs, options) => {
  const docsWithoutGeneratedMangoDocs = docs.filter(removeGeneratedMangoDocs);

  if (Constants.LAYOUT_ORIENTATION.JSON === options.selectedLayout) {
    return getJsonViewData(docsWithoutGeneratedMangoDocs, options);
  } else {
    return getTableViewData(docsWithoutGeneratedMangoDocs, options);
  }
};

export default function resultsState (state = initialState, action) {
  switch (action.type) {

    case ActionTypes.INDEX_RESULTS_REDUX_INITIALIZE:
      return Object.assign({}, state, {
        queryParams: action.params
      });
    break;

    case ActionTypes.INDEX_RESULTS_REDUX_IS_LOADING:
      return Object.assign({}, state, {
        isLoading: true,
        docs: [],
        selectedDocs: [],
        dataForRendering: []
      });
    break;

    case ActionTypes.INDEX_RESULTS_REDUX_SELECT_DOC:
      return Object.assign({}, state, {
        selectedDocs: state.selectedDocs.push(action.doc)
      });
    break;

    case ActionTypes.INDEX_RESULTS_REDUX_NEW_RESULTS:
      return Object.assign({}, state, {
        docs: action.docs,
        dataForRendering: buildDataForRendering(action.docs, {
          databaseName: action.databaseName,
          selectedLayout: state.selectedLayout,
          selectedFieldsTableView: state.selectedFieldsTableView,
          showAllFieldsTableView: state.showAllFieldsTableVie,
          cachedFieldsTableView: state.cachedFieldsTableView,
          typeOfIndex: state.typeOfIndex
        }),
        isLoading: false,
        selectedDocs: [],
        isEditable: true, //TODO: determine logic for this
        queryParams: {
          urlParams: state.queryParams.urlParams,
          docParams: action.params
        }
      });

    default:
      return state;
  }
};

export const getDocs = state => state.docs;
export const getSelectedDocs = state => state.selectedDocs;
export const getIsLoading = state => state.isLoading;
export const getDataForRendering = state => state.dataForRendering;
export const getIsEditable = state => state.isEditable;
export const getSelectedLayout = state => state.selectedLayout;
export const getTextEmptyIndex = state => state.textEmptyIndex;
export const getTypeOfIndex = state => state.typeOfIndex;
export const getQueryParams = state => state.queryParams;

export const getHasResults = (state) => {
  return !state.isLoading && state.docs && state.docs.length > 0;
};

export const getAllDocsSelected = (state) => {
  if (!state.docs || !state.selectedDocs || state.docs.length === 0 || state.selectedDocs.length === 0) {
    return false;
  }

  // Iterate over the results and determine if each one is included
  // in the selectedDocs array.
  //
  // This is O(n^2) which makes me unhappy.  We slowly shrink the
  // selectedDocsCopy array to improve this slightly and we know
  // that the number of docs will never be that large due to the
  // per page limitations we force on the user.
  const selectedDocsCopy = state.selectedDocs;
  state.docs.forEach((doc) => {

    // Helper function for finding index of a selected doc in the current
    // results list.
    const indexOfDoc = (selectedDoc) => {
      return doc._id === selectedDoc._id;
    };

    if (selectedDocsCopy.findIndex(indexOfDoc) === -1) {
      return false;
    }

    selectedDocsCopy.splice(indexOfDoc, 1);
  });

  return true;
};

export const getHasDocsSelected = (state) => {
  return state.selectedDocs && state.selectedDocs.length > 0;
};

export const getNumDocsSelected = (state) => {
  return state.selectedDocs && state.selectedDocs.length;
};
