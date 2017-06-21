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
import QueryOptions from '../components/queryoptions/QueryOptions';
import { changeLayout, resetState } from '../apis/base';
import { resetPagination } from '../apis/pagination';
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
  queryOptionsFilterOnlyDdocs
} from '../apis/queryoptions';
import {
  getQueryOptionsPanel,
  getFetchParams,
  getQueryOptionsParams,
  getPerPage,
  getSelectedLayout
} from '../reducers';

const mapStateToProps = ({indexResults}, ownProps) => {
  const queryOptionsPanel = getQueryOptionsPanel(indexResults);
  return {
    contentVisible: queryOptionsPanel.isVisible,
    includeDocs: queryOptionsPanel.includeDocs,
    showReduce: queryOptionsPanel.showReduce,
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
      dispatch(queryOptionsExecute(ownProps.fetchUrl, queryOptionsParams, perPage));
    },
    queryOptionsFilterOnlyDdocs: () => {
      dispatch(queryOptionsFilterOnlyDdocs());
    },
    changeLayout: (newLayout) => {
      dispatch(changeLayout(newLayout));
    },
    resetState: () => {
      dispatch(resetState());
    }
  };
};

export default connect (
  mapStateToProps,
  mapDispatchToProps
)(QueryOptions);
