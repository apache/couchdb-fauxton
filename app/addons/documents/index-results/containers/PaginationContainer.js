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
import PaginationFooter from '../components/pagination/PaginationFooter';
import {
  toggleShowAllColumns,
  updatePerPageResults,
  paginateNext,
  paginatePrevious
} from '../../api';
import {
  getDocs,
  getSelectedDocs,
  getHasResults,
  getQueryParams,
  getPageStart,
  getPageEnd,
  getPerPage,
  getPrioritizedEnabled,
  getShowPrioritizedEnabled,
  getDisplayedFields,
  getCanShowNext,
  getCanShowPrevious
} from '../../reducers';


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
    queryParams: getQueryParams(indexResults)
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    toggleShowAllColumns: () => { dispatch(toggleShowAllColumns()); },
    updatePerPageResults: (amount, params) => { dispatch(updatePerPageResults(ownProps.databaseName, amount, params)); },
    paginateNext: (params, perPage) => { dispatch(paginateNext(ownProps.databaseName, params, perPage)); },
    paginatePrevious: (params, perPage) => { dispatch(paginatePrevious(ownProps.databaseName, params, perPage)); }
  };
};

export default connect (
  mapStateToProps,
  mapDispatchToProps
)(PaginationFooter);
