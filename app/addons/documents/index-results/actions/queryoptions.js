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

import ActionTypes from '../actiontypes';
import { fetchDocs } from './fetch';

const updateQueryOptions = (queryOptions) => {
  return {
    type: ActionTypes.INDEX_RESULTS_REDUX_NEW_QUERY_OPTIONS,
    options: queryOptions
  };
};

export const resetFetchParamsBeforeExecute = (perPage) => {
  return {
    limit: perPage + 1,
    skip: 0
  };
};

export const queryOptionsExecute = (queryDocs, queryOptionsParams, perPage) => {
  const fetchParams = resetFetchParamsBeforeExecute(perPage);
  return fetchDocs(queryDocs, fetchParams, queryOptionsParams);
};

export const queryOptionsToggleVisibility = (newVisibility) => {
  return updateQueryOptions({
    isVisible: newVisibility
  });
};

export const queryOptionsToggleReduce = (previousReduce) => {
  if (previousReduce) {
    return updateQueryOptions({
      reduce: !previousReduce
    });
  }
  // Disables includeDocs if reduce is changing to true
  return updateQueryOptions({
    reduce: !previousReduce,
    includeDocs: false
  });

};

export const queryOptionsUpdateGroupLevel = (newGroupLevel) => {
  return updateQueryOptions({
    groupLevel: newGroupLevel
  });
};

export const queryOptionsToggleByKeys = (previousShowByKeys) => {
  return updateQueryOptions({
    showByKeys: !previousShowByKeys,
    showBetweenKeys: !!previousShowByKeys
  });
};

export const queryOptionsToggleBetweenKeys = (previousShowBetweenKeys) => {
  return updateQueryOptions({
    showBetweenKeys: !previousShowBetweenKeys,
    showByKeys: !!previousShowBetweenKeys
  });
};

export const queryOptionsUpdateBetweenKeys = (newBetweenKeys) => {
  return updateQueryOptions({
    betweenKeys: newBetweenKeys
  });
};

export const queryOptionsUpdateByKeys = (newByKeys) => {
  return updateQueryOptions({
    byKeys: newByKeys
  });
};

export const queryOptionsToggleDescending = (previousDescending) => {
  return updateQueryOptions({
    descending: !previousDescending
  });
};

export const queryOptionsUpdateSkip = (newSkip) => {
  return updateQueryOptions({
    skip: newSkip
  });
};

export const queryOptionsUpdateLimit = (newLimit) => {
  return updateQueryOptions({
    limit: newLimit
  });
};

export const queryOptionsToggleIncludeDocs = (previousIncludeDocs) => {
  return updateQueryOptions({
    includeDocs: !previousIncludeDocs
  });
};

export const queryOptionsFilterOnlyDdocs = () => {
  return updateQueryOptions({
    betweenKeys: {
      include: false,
      startkey: '"_design"',
      endkey: '"_design0"'
    },
    showBetweenKeys: true,
    showByKeys: false
  });
};

export const queryOptionsRemoveFilterOnlyDdocs = () => {
  return updateQueryOptions({
    betweenKeys: {},
    showBetweenKeys: false,
    showByKeys: false
  });
};

export const queryOptionsToggleStable = previous => {
  return updateQueryOptions({
    stable: !previous
  });
};

export const queryOptionsChangeUpdate = value => {
  return updateQueryOptions({
    update: value.toString()
  });
};
