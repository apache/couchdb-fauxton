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

import {
  toggleShowAllColumns,
  setPerPage,
  resetFetchParamsBeforePerPageChange,
  incrementSkipForPageNext,
  decrementSkipForPagePrevious,
  resetPagination
} from '../index-results/actions/pagination';
import ActionTypes from '../index-results/actiontypes';
import FauxtonAPI from '../../../core/api';

describe('Docs Pagination API', () => {
  it('toggleShowAllColumns returns the proper event to dispatch', () => {
    expect(toggleShowAllColumns()).toEqual({
      type: ActionTypes.INDEX_RESULTS_REDUX_TOGGLE_SHOW_ALL_COLUMNS
    });
  });

  it('setPerPage returns the proper event to dispatch', () => {
    const pageSize = 10;
    expect(setPerPage(pageSize)).toEqual({
      type: ActionTypes.INDEX_RESULTS_REDUX_SET_PER_PAGE,
      perPage: pageSize
    });
  });

  describe('resetFetchParamsBeforePerPageChange', () => {
    let fetchParams, queryOptionsParams;
    let amount = 10;
    beforeEach(() => {
      fetchParams = {
        skip: 20,
        limit: 21
      };
      queryOptionsParams = {};
    });

    it('fetchs with proper params when queryOptions doesnt have skip', () => {
      expect(resetFetchParamsBeforePerPageChange(fetchParams, queryOptionsParams, amount)).toEqual({
        limit: 11,
        skip: 0
      });
    });

    it('fetches with the proper params when queryOptions does have skip', () => {
      queryOptionsParams.skip = 5;
      expect(resetFetchParamsBeforePerPageChange(fetchParams, queryOptionsParams, amount)).toEqual({
        limit: 11,
        skip: 5
      });
    });
  });

  it('incrementSkipForPageNext returns the proper fetch params', () => {
    const fetchParams = {
      skip: 0,
      limit: 21
    };
    const perPage = 20;
    expect(incrementSkipForPageNext(fetchParams, perPage)).toEqual({
      skip: 20,
      limit: 21
    });
  });

  describe('decrementSkipForPagePrevious', () => {
    it('returns the proper fetch params when greater than zero', () => {
      const fetchParams = {
        skip: 40,
        limit: 21
      };
      const perPage = 20;
      expect(decrementSkipForPagePrevious(fetchParams, perPage)).toEqual({
        skip: 20,
        limit: 21
      });
    });

    it('returns the proper fetch params when skip less than zero', () => {
      const fetchParams = {
        skip: 5,
        limit: 21
      };
      const perPage = 20;
      expect(decrementSkipForPagePrevious(fetchParams, perPage)).toEqual({
        skip: 0,
        limit: 21
      });
    });
  });

  it('resetPagination defaults to FauxtonAPI page size if arg empty', () => {
    expect(resetPagination()).toEqual({
      type: ActionTypes.INDEX_RESULTS_REDUX_SET_PER_PAGE,
      perPage: FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE
    });
  });
});
