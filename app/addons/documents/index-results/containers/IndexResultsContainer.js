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

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import IndexResults from '../components/results/IndexResults';
import { fetchDocs, bulkDeleteDocs } from '../actions/fetch';
import { queryOptionsToggleIncludeDocs } from '../actions/queryoptions';
import {
  selectDoc,
  changeLayout,
  bulkCheckOrUncheck,
  changeTableHeaderAttribute,
  resetState,
  updateResultsStyle
} from '../actions/base';
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
  getDocType,
  getFetchParams,
  getQueryOptionsParams,
  getResultsStyle
} from '../reducers';


const mapStateToProps = ({indexResults}, ownProps) => {
  return {
    noResultsWarning: indexResults.noResultsWarning,
    docs: getDocs(indexResults),
    selectedDocs: getSelectedDocs(indexResults),
    isLoading: getIsLoading(indexResults),
    hasResults: getHasResults(indexResults),
    results: getDataForRendering(indexResults, ownProps.databaseName, ownProps.deleteEnabled),
    isEditable: getIsEditable(indexResults),
    selectedLayout: getSelectedLayout(indexResults),
    allDocumentsSelected: getAllDocsSelected(indexResults),
    hasSelectedItem: getHasDocsSelected(indexResults),
    numDocsSelected: getNumDocsSelected(indexResults),
    textEmptyIndex: getTextEmptyIndex(indexResults),
    docType: getDocType(indexResults),
    fetchParams: getFetchParams(indexResults),
    queryOptionsParams: getQueryOptionsParams(indexResults),
    partitionKey: ownProps.partitionKey,
    resultsStyle: getResultsStyle(indexResults)
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchDocs: (fetchParams, queryOptionsParams) => {
      dispatch(fetchDocs(ownProps.queryDocs, fetchParams, queryOptionsParams));
    },
    selectDoc: (doc, selectedDocs) => {
      dispatch(selectDoc(doc, selectedDocs));
    },
    bulkDeleteDocs: (docs, fetchParams, queryOptionsParams) => {
      dispatch(bulkDeleteDocs(ownProps.databaseName,
        ownProps.queryDocs,
        docs,
        ownProps.designDocs,
        fetchParams,
        queryOptionsParams,
        ownProps.docType));
    },
    changeLayout: (newLayout) => {
      dispatch(changeLayout(newLayout));
    },
    bulkCheckOrUncheck: (docs, selectedDocs, allDocumentsSelected) => {
      dispatch(bulkCheckOrUncheck(docs, selectedDocs, allDocumentsSelected, ownProps.docType));
    },
    changeTableHeaderAttribute: (newField, selectedFields) => {
      dispatch(changeTableHeaderAttribute(newField, selectedFields));
    },
    resetState: () => {
      dispatch(resetState());
    },
    queryOptionsToggleIncludeDocs: (previousIncludeDocs) => {
      dispatch(queryOptionsToggleIncludeDocs(previousIncludeDocs));
    },
    updateResultsStyle: (newStyle) => {
      dispatch(updateResultsStyle(newStyle));
    }
  };
};

const IndexResultsContainer = connect (
  mapStateToProps,
  mapDispatchToProps
)(IndexResults);

export default IndexResultsContainer;

IndexResultsContainer.propTypes = {
  queryDocs: PropTypes.func.isRequired,
  docType: PropTypes.string.isRequired
};
