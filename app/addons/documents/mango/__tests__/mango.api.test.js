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

import sinon from "sinon";
import utils from "../../../../../test/mocha/testUtils";
import FauxtonAPI from "../../../../core/api";
import * as MangoAPI from '../mango.api';
import Constants from '../../constants';

const fetchMock = require('fetch-mock');
const assert = utils.assert;
const restore = utils.restore;

describe('Mango API', () => {

  const paginationLimit = 6;

  beforeEach(() => {
    sinon.stub(FauxtonAPI, 'urls').returns('mock-url');
  });

  afterEach(() => {
    restore(FauxtonAPI.urls);
  });

  describe('mangoQueryDocs', () => {
    it('returns document type INDEX_RESULTS_DOC_TYPE.MANGO_QUERY', (done) => {
      fetchMock.mock("*", { times: 2 });
      MangoAPI.mangoQueryDocs('myDB', {}, {}).then((res) => {
        assert.equal(res.docType, Constants.INDEX_RESULTS_DOC_TYPE.MANGO_QUERY);
        done();
      });
    });
  });

  describe('mergeFetchParams', () => {
    it('adjusts the query "skip" field based on pagination fetch params', () => {
      // 1st page and query's skip is zero
      let mergedParams = MangoAPI.mergeFetchParams({skip: 0}, {skip: 0, limit: paginationLimit});
      assert.equal(mergedParams.skip, 0);

      // 1st page and query's skip is non-zero
      mergedParams = MangoAPI.mergeFetchParams({skip: 3}, {skip: 0, limit: paginationLimit});
      assert.equal(mergedParams.skip, 3);

      // non-1st page and query's skip is zero
      mergedParams = MangoAPI.mergeFetchParams({skip: 0}, {skip: 5, limit: paginationLimit});
      assert.equal(mergedParams.skip, 5);

      // non-1st page and query's skip is non-zero
      mergedParams = MangoAPI.mergeFetchParams({skip: 3}, {skip: 5, limit: paginationLimit});
      assert.equal(mergedParams.skip, 8);

    });

    it('uses ZERO when query limit is ZERO', () => {
      const mergedParams = MangoAPI.mergeFetchParams({limit: 0}, {skip: 0, limit: paginationLimit});
      assert.equal(mergedParams.limit, 0);
    });

    it('uses pagination limit when query limit is not provided', () => {
      const mergedParams = MangoAPI.mergeFetchParams({}, {skip: 5, limit: paginationLimit});
      assert.equal(mergedParams.limit, paginationLimit);
    });

    it('uses pagination limit if query limit has not been reached', () => {
      let mergedParams = MangoAPI.mergeFetchParams({limit: 50}, {skip: 5, limit: paginationLimit});
      assert.equal(mergedParams.limit, paginationLimit);

      mergedParams = MangoAPI.mergeFetchParams({limit: 50}, {skip: 15, limit: paginationLimit});
      assert.equal(mergedParams.limit, paginationLimit);
    });

    it('respects query limit when value is lower than docs per page', () => {
      const mergedParams = MangoAPI.mergeFetchParams({limit: 3}, {skip: 0, limit: paginationLimit});
      assert.equal(mergedParams.limit, 3);
    });

    it('respects query limit when value is greater than docs per page', () => {
      // Simulates loading of 3rd page
      const mergedParams = MangoAPI.mergeFetchParams({limit: 17}, {skip: 15, limit: paginationLimit});
      assert.equal(mergedParams.limit, 2);
    });

    it('respects query limit when value is a multipe of docs per page', () => {
      // 1st page
      let mergedParams = MangoAPI.mergeFetchParams({limit: 5}, {skip: 0, limit: paginationLimit});
      assert.equal(mergedParams.limit, 5);

      // non-1st page
      mergedParams = MangoAPI.mergeFetchParams({limit: 15}, {skip: 10, limit: paginationLimit});
      assert.equal(mergedParams.limit, 5);
    });

    it('works correctly with both skip and limit query params', () => {
      // Simulates loading of 3rd page
      const mergedParams = MangoAPI.mergeFetchParams({skip:10, limit: 17}, {skip: 15, limit: paginationLimit});
      assert.equal(mergedParams.limit, 2);
      assert.equal(mergedParams.skip, 25);
    });

  });

  describe('fetchIndexes', () => {
    it('returns document type INDEX_RESULTS_DOC_TYPE.MANGO_INDEX', (done) => {
      fetchMock.once("*", {});
      MangoAPI.fetchIndexes('myDB', {}).then((res) => {
        assert.equal(res.docType, Constants.INDEX_RESULTS_DOC_TYPE.MANGO_INDEX);
        done();
      });
    });
  });
});
