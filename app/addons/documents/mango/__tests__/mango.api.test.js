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

import fetchMock from 'fetch-mock';
import Constants from '../../constants';
import * as MangoAPI from '../mango.api';
import '../../base';

describe('Mango API', () => {

  const paginationLimit = 6;

  afterEach(() => {
    fetchMock.reset();
  });

  describe('mangoQueryDocs', () => {
    it('returns document type INDEX_RESULTS_DOC_TYPE.MANGO_QUERY', () => {
      fetchMock.mock("*", { times: 2 });
      return MangoAPI.mangoQueryDocs('myDB', '', {}, {}).then((res) => {
        expect(res.docType).toBe(Constants.INDEX_RESULTS_DOC_TYPE.MANGO_QUERY);
      });
    });
  });

  describe('mangoQuery', () => {
    it('adds partition key to the query URL when one is set', () => {
      fetchMock.postOnce('./myDB/_partition/part1/_find', {
        status: 200,
        body: { ok: true }
      }).catch({
        status: 500,
        body: { ok: false }
      });
      return MangoAPI.mangoQuery('myDB', 'part1', {}, {}).then(() => {
        expect(fetchMock.done()).toBe(true);
      });
    });

    it('does not add partition key to the query URL when one is set', () => {
      fetchMock.postOnce('./myDB/_find', {
        status: 200,
        body: { ok: true }
      }).catch({
        status: 500,
        body: { ok: false }
      });
      return MangoAPI.mangoQuery('myDB', '', {}, {}).then(() => {
        expect(fetchMock.done()).toBe(true);
      });
    });
  });

  describe('mergeFetchParams', () => {
    it('adjusts the query "skip" field based on pagination fetch params', () => {
      // 1st page and query's skip is zero
      let mergedParams = MangoAPI.mergeFetchParams({skip: 0}, {skip: 0, limit: paginationLimit});
      expect(mergedParams.skip).toBe(0);

      // 1st page and query's skip is non-zero
      mergedParams = MangoAPI.mergeFetchParams({skip: 3}, {skip: 0, limit: paginationLimit});
      expect(mergedParams.skip).toBe(3);

      // non-1st page and query's skip is zero
      mergedParams = MangoAPI.mergeFetchParams({skip: 0}, {skip: 5, limit: paginationLimit});
      expect(mergedParams.skip).toBe(5);

      // non-1st page and query's skip is non-zero
      mergedParams = MangoAPI.mergeFetchParams({skip: 3}, {skip: 5, limit: paginationLimit});
      expect(mergedParams.skip).toBe(8);

    });

    it('uses ZERO when query limit is ZERO', () => {
      const mergedParams = MangoAPI.mergeFetchParams({limit: 0}, {skip: 0, limit: paginationLimit});
      expect(mergedParams.limit).toBe(0);
    });

    it('uses pagination limit when query limit is not provided', () => {
      const mergedParams = MangoAPI.mergeFetchParams({}, {skip: 5, limit: paginationLimit});
      expect(mergedParams.limit).toBe(paginationLimit);
    });

    it('uses pagination limit if query limit has not been reached', () => {
      let mergedParams = MangoAPI.mergeFetchParams({limit: 50}, {skip: 5, limit: paginationLimit});
      expect(mergedParams.limit).toBe(paginationLimit);

      mergedParams = MangoAPI.mergeFetchParams({limit: 50}, {skip: 15, limit: paginationLimit});
      expect(mergedParams.limit).toBe(paginationLimit);
    });

    it('respects query limit when value is lower than docs per page', () => {
      const mergedParams = MangoAPI.mergeFetchParams({limit: 3}, {skip: 0, limit: paginationLimit});
      expect(mergedParams.limit).toBe(3);
    });

    it('respects query limit when value is greater than docs per page', () => {
      // Simulates loading of 3rd page
      const mergedParams = MangoAPI.mergeFetchParams({limit: 17}, {skip: 15, limit: paginationLimit});
      expect(mergedParams.limit).toBe(2);
    });

    it('respects query limit when value is a multipe of docs per page', () => {
      // 1st page
      let mergedParams = MangoAPI.mergeFetchParams({limit: 5}, {skip: 0, limit: paginationLimit});
      expect(mergedParams.limit).toBe(5);

      // non-1st page
      mergedParams = MangoAPI.mergeFetchParams({limit: 15}, {skip: 10, limit: paginationLimit});
      expect(mergedParams.limit).toBe(5);
    });

    it('works correctly with both skip and limit query params', () => {
      // Simulates loading of 3rd page
      const mergedParams = MangoAPI.mergeFetchParams({skip:10, limit: 17}, {skip: 15, limit: paginationLimit});
      expect(mergedParams.limit).toBe(2);
      expect(mergedParams.skip).toBe(25);
    });

  });

  describe('fetchIndexes', () => {
    it('returns document type INDEX_RESULTS_DOC_TYPE.MANGO_INDEX', () => {
      fetchMock.once("*", {});
      return MangoAPI.fetchIndexes('myDB', {}).then((res) => {
        expect(res.docType).toBe(Constants.INDEX_RESULTS_DOC_TYPE.MANGO_INDEX);
      });
    });
  });
});
