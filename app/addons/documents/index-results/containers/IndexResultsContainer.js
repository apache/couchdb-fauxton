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

import { connect } from 'react-redux';
import IndexResults from '../components/IndexResults';
import {
  fetchAllDocs,
  initialize,
  selectDoc,
  bulkDeleteDocs,
  changeLayout,
  bulkCheckOrUncheck,
  changeTableHeaderAttribute,
  resetState
} from '../../api';
import {
  getDocs,
  getSelectedDocs,
  getIsLoading,
  getHasResults,
  getDataForRendering,
  getIsEditable,
  getSelectedLayout,
  getAllDocsSelected,
  getHasDocsSelected,
  getNumDocsSelected,
  getTextEmptyIndex,
  getTypeOfIndex,
  getQueryParams
} from '../../reducers';


const mapStateToProps = ({indexResults}, ownProps) => {
  return {
    docs: getDocs(indexResults),
    selectedDocs: getSelectedDocs(indexResults),
    isLoading: getIsLoading(indexResults),
    hasResults: getHasResults(indexResults),
    results: getDataForRendering(indexResults, ownProps.databaseName),
    isEditable: getIsEditable(indexResults),
    selectedLayout: getSelectedLayout(indexResults),
    allDocumentsSelected: getAllDocsSelected(indexResults),
    hasSelectedItem: getHasDocsSelected(indexResults),
    numDocsSelected: getNumDocsSelected(indexResults),
    textEmptyIndex: getTextEmptyIndex(indexResults),
    typeOfIndex: getTypeOfIndex(indexResults),
    queryParams: getQueryParams(indexResults)
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchAllDocs: (params) => { dispatch(fetchAllDocs(ownProps.databaseName, params)); },
    initialize: () => { dispatch(initialize(ownProps.params)); },
    selectDoc: (doc, selectedDocs) => { dispatch(selectDoc(doc, selectedDocs)); },
    bulkDeleteDocs: (docs, params) => {
      dispatch(bulkDeleteDocs(ownProps.databaseName, docs, ownProps.designDocs, params));
    },
    changeLayout: (newLayout) => { dispatch(changeLayout(newLayout)); },
    bulkCheckOrUncheck: (docs, selectedDocs, allDocumentsSelected) => {
      dispatch(bulkCheckOrUncheck(docs, selectedDocs, allDocumentsSelected));
    },
    changeTableHeaderAttribute: (newField, selectedFields) => {
      dispatch(changeTableHeaderAttribute(newField, selectedFields));
    },
    resetState: () => { dispatch(resetState()); }
  };
};

export default connect (
  mapStateToProps,
  mapDispatchToProps
)(IndexResults);
