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
import PaginationFooter from '../components/pagination/PaginationFooter';
import {
  toggleShowAllColumns,
  updatePerPageResults,
  paginateNext,
  paginatePrevious
} from '../actions/pagination';
import {
  getDocs,
  getSelectedDocs,
  getHasResults,
  getFetchParams,
  getPageStart,
  getPageEnd,
  getPerPage,
  getPrioritizedEnabled,
  getShowPrioritizedEnabled,
  getDisplayedFields,
  getCanShowNext,
  getCanShowPrevious,
  getQueryOptionsParams
} from '../reducers';


const mapStateToProps = ({indexResults}, ownProps) => {
  return {
    docs: getDocs(indexResults),
    selectedDocs: getSelectedDocs(indexResults),
    hasResults: getHasResults(indexResults),
    pageStart: getPageStart(indexResults),
    pageEnd: getPageEnd(indexResults),
    perPage: getPerPage(indexResults),
    prioritizedEnabled: getPrioritizedEnabled(indexResults),
    showPrioritizedEnabled: getShowPrioritizedEnabled(indexResults),
    displayedFields: getDisplayedFields(indexResults, ownProps.databaseName),
    canShowNext: getCanShowNext(indexResults),
    canShowPrevious: getCanShowPrevious(indexResults),
    fetchParams: getFetchParams(indexResults),
    queryOptionsParams: getQueryOptionsParams(indexResults)
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    toggleShowAllColumns: () => {
      dispatch(toggleShowAllColumns());
    },
    updatePerPageResults: (amount, fetchParams, queryOptionsParams) => {
      dispatch(updatePerPageResults(ownProps.queryDocs, fetchParams, queryOptionsParams, amount));
    },
    paginateNext: (fetchParams, queryOptionsParams, perPage) => {
      dispatch(paginateNext(ownProps.queryDocs, fetchParams, queryOptionsParams, perPage));
    },
    paginatePrevious: (fetchParams, queryOptionsParams, perPage) => {
      dispatch(paginatePrevious(ownProps.queryDocs, fetchParams, queryOptionsParams, perPage));
    }
  };
};

const PaginationFooterContainer = connect (
  mapStateToProps,
  mapDispatchToProps
)(PaginationFooter);

export default PaginationFooterContainer;

PaginationFooterContainer.propTypes = {
  queryDocs: PropTypes.func.isRequired
};
