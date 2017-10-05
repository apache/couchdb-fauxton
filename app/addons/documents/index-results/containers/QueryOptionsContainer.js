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
import DocHelpers from '../../helpers';
import QueryOptions from '../components/queryoptions/QueryOptions';
import { changeLayout, resetState } from '../actions/base';
import { resetPagination } from '../actions/pagination';
import {
  queryOptionsExecute,
  queryOptionsToggleReduce,
  queryOptionsUpdateGroupLevel,
  queryOptionsToggleByKeys,
  queryOptionsToggleBetweenKeys,
  queryOptionsUpdateBetweenKeys,
  queryOptionsUpdateByKeys,
  queryOptionsToggleDescending,
  queryOptionsUpdateSkip,
  queryOptionsUpdateLimit,
  queryOptionsToggleIncludeDocs,
  queryOptionsToggleVisibility,
  queryOptionsFilterOnlyDdocs,
  queryOptionsRemoveFilterOnlyDdocs
} from '../actions/queryoptions';
import {
  getQueryOptionsPanel,
  getFetchParams,
  getQueryOptionsParams,
  getPerPage,
  getSelectedLayout
} from '../reducers';

const showReduce = (designDocs, selectedNavItem) => {
  return DocHelpers.selectedViewContainsReduceFunction(designDocs, selectedNavItem);
};

const mapStateToProps = ({indexResults, sidebar}, ownProps) => {
  const queryOptionsPanel = getQueryOptionsPanel(indexResults);
  return {
    contentVisible: queryOptionsPanel.isVisible,
    includeDocs: queryOptionsPanel.includeDocs,
    showReduce: showReduce(sidebar.designDocs, ownProps.selectedNavItem),
    reduce: queryOptionsPanel.reduce,
    groupLevel: queryOptionsPanel.groupLevel,
    showByKeys: queryOptionsPanel.showByKeys,
    showBetweenKeys: queryOptionsPanel.showBetweenKeys,
    betweenKeys: queryOptionsPanel.betweenKeys,
    byKeys: queryOptionsPanel.byKeys,
    descending: queryOptionsPanel.descending,
    skip: queryOptionsPanel.skip,
    limit: queryOptionsPanel.limit,
    fetchParams: getFetchParams(indexResults),
    queryOptionsParams: getQueryOptionsParams(indexResults),
    perPage: getPerPage(indexResults),
    selectedLayout: getSelectedLayout(indexResults),
    ddocsOnly: ownProps.ddocsOnly
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    resetPagination: (perPage) => {
      dispatch(resetPagination(perPage));
    },
    queryOptionsToggleReduce: (previousReduce) => {
      dispatch(queryOptionsToggleReduce(previousReduce));
    },
    queryOptionsUpdateGroupLevel: (newGroupLevel) => {
      dispatch(queryOptionsUpdateGroupLevel(newGroupLevel));
    },
    queryOptionsToggleByKeys: (previousShowByKeys) => {
      dispatch(queryOptionsToggleByKeys(previousShowByKeys));
    },
    queryOptionsToggleBetweenKeys: (previousShowBetweenKeys) => {
      dispatch(queryOptionsToggleBetweenKeys(previousShowBetweenKeys));
    },
    queryOptionsUpdateBetweenKeys: (newBetweenKeys) => {
      dispatch(queryOptionsUpdateBetweenKeys(newBetweenKeys));
    },
    queryOptionsUpdateByKeys: (newByKeys) => {
      dispatch(queryOptionsUpdateByKeys(newByKeys));
    },
    queryOptionsToggleDescending: (previousDescending) => {
      dispatch(queryOptionsToggleDescending(previousDescending));
    },
    queryOptionsUpdateSkip: (newSkip) => {
      dispatch(queryOptionsUpdateSkip(newSkip));
    },
    queryOptionsUpdateLimit: (newLimit) => {
      dispatch(queryOptionsUpdateLimit(newLimit));
    },
    queryOptionsToggleIncludeDocs: (previousIncludeDocs) => {
      dispatch(queryOptionsToggleIncludeDocs(previousIncludeDocs));
    },
    queryOptionsToggleVisibility: (newVisibility) => {
      dispatch(queryOptionsToggleVisibility(newVisibility));
    },
    queryOptionsExecute: (queryOptionsParams, perPage) => {
      dispatch(queryOptionsExecute(ownProps.queryDocs, queryOptionsParams, perPage));
    },
    queryOptionsApplyFilterOnlyDdocs: () => {
      dispatch(queryOptionsFilterOnlyDdocs());
    },
    queryOptionsRemoveFilterOnlyDdocs: () => {
      dispatch(queryOptionsRemoveFilterOnlyDdocs());
    },
    changeLayout: (newLayout) => {
      dispatch(changeLayout(newLayout));
    },
    resetState: () => {
      dispatch(resetState());
    }
  };
};

const QueryOptionsContainer = connect (
  mapStateToProps,
  mapDispatchToProps
)(QueryOptions);

export default QueryOptionsContainer;

QueryOptionsContainer.propTypes = {
  queryDocs: PropTypes.func.isRequired
};
