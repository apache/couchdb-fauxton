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
  mergeParams,
  removeOverflowDocsAndCalculateHasNext,
  validateBulkDelete,
  processBulkDeleteResponse
} from '../index-results/actions/fetch';
import {queryAllDocs, postToBulkDocs} from '../index-results/api';
import fetchMock from 'fetch-mock';
import app from '../../../app';
import sinon from 'sinon';
import SidebarActions from '../sidebar/actions';
import FauxtonAPI from '../../../core/api';
import '../base';
import Constants from '../constants';

describe('Docs Fetch API', () => {
  describe('mergeParams', () => {
    let fetchParams, queryOptionsParams;
    beforeEach(() => {
      fetchParams = {
        skip: 0,
        limit: 21
      };
      queryOptionsParams = {};
    });

    it('supports default fetch and queryOptions params', () => {
      expect(mergeParams(fetchParams, queryOptionsParams)).toEqual({
        params: {
          skip: 0,
          limit: 21
        },
        totalDocsRemaining: NaN
      });
    });

    it('supports a manual skip in queryOptionsParams', () => {
      queryOptionsParams.skip = 5;
      expect(mergeParams(fetchParams, queryOptionsParams)).toEqual({
        params: {
          skip: 5,
          limit: 21
        },
        totalDocsRemaining: NaN
      });
    });

    it('manual limit in queryOptionsParams does not affect merge limit', () => {
      queryOptionsParams.limit = 50;
      expect(mergeParams(fetchParams, queryOptionsParams)).toEqual({
        params: {
          skip: 0,
          limit: 21
        },
        totalDocsRemaining: 50
      });
    });

    it('totalDocsRemaining is determined by queryOptions limit and skip on first page', () => {
      queryOptionsParams.skip = 10;
      queryOptionsParams.limit = 200;
      expect(mergeParams(fetchParams, queryOptionsParams)).toEqual({
        params: {
          skip: 10,
          limit: 21
        },
        totalDocsRemaining: 200
      });
    });

    it('totalDocsRemaining is determined by queryOptions limit and fetch skip on later pages', () => {
      queryOptionsParams.skip = 10;
      queryOptionsParams.limit = 200;
      fetchParams.skip = 30;
      expect(mergeParams(fetchParams, queryOptionsParams)).toEqual({
        params: {
          skip: 30,
          limit: 21
        },
        totalDocsRemaining: 180
      });
    });

    it('include conflicts if requested in fetchParams', () => {
      fetchParams.conflicts = true;
      expect(mergeParams(fetchParams, queryOptionsParams)).toEqual({
        params: {
          skip: 0,
          limit: 21,
          conflicts: true
        },
        totalDocsRemaining: NaN
      });
    });
  });

  describe('removeOverflowDocsAndCalculateHasNext', () => {
    let docs;
    beforeEach(() => {
      docs = [
        {
          _id: 'foo',
          _rev: 'bar'
        },
        {
          _id: 'xyz',
          _rev: 'abc'
        },
        {
          _id: 'test',
          _rev: 'value'
        }
      ];
    });

    it('truncates last doc and has next if length equal to fetch limit', () => {
      const totalDocsRemaining = NaN;
      const fetchLimit = 3;
      expect(removeOverflowDocsAndCalculateHasNext(docs, totalDocsRemaining, fetchLimit)).toEqual({
        finalDocList: [
          {
            _id: 'foo',
            _rev: 'bar'
          },
          {
            _id: 'xyz',
            _rev: 'abc'
          }
        ],
        canShowNext: true
      });
    });

    it('does not truncate and does not have next if length less than fetch limit', () => {
      const totalDocsRemaining = NaN;
      const fetchLimit = 4;
      expect(removeOverflowDocsAndCalculateHasNext(docs, totalDocsRemaining, fetchLimit)).toEqual({
        finalDocList: [
          {
            _id: 'foo',
            _rev: 'bar'
          },
          {
            _id: 'xyz',
            _rev: 'abc'
          },
          {
            _id: 'test',
            _rev: 'value'
          }
        ],
        canShowNext: false
      });
    });

    it('truncates all extra docs if length is greater than totalDocsRemaining', () => {
      const totalDocsRemaining = 1;
      const fetchLimit = 3;
      expect(removeOverflowDocsAndCalculateHasNext(docs, totalDocsRemaining, fetchLimit)).toEqual({
        finalDocList: [
          {
            _id: 'foo',
            _rev: 'bar'
          }
        ],
        canShowNext: false
      });
    });
  });

  describe('queryAllDocs', () => {
    const docs = {
      "total_rows": 2,
      "offset": 0,
      "rows": [
        {
          "id": "foo",
          "key": "foo",
          "value": {
            "rev": "1-1390740c4877979dbe8998382876556c"
          }
        },
        {
          "id": "foo2",
          "key": "foo2",
          "value": {
            "rev": "2-1390740c4877979dbe8998382876556c"
          }
        }
      ]
    };

    it('queries _all_docs with default params', () => {
      const params = {
        limit: 21,
        skip: 0
      };
      const fetchUrl = '/testdb/_all_docs';
      const query = app.utils.queryString(params);
      const url = `${fetchUrl}?${query}`;
      fetchMock.getOnce(url, docs);

      return queryAllDocs(fetchUrl, '', params).then((res) => {
        expect(res).toEqual({
          docType: Constants.INDEX_RESULTS_DOC_TYPE.VIEW,
          docs: [
            {
              id: "foo",
              key: "foo",
              value: {
                rev: "1-1390740c4877979dbe8998382876556c"
              }
            },
            {
              id: "foo2",
              key: "foo2",
              value: {
                rev: "2-1390740c4877979dbe8998382876556c"
              }
            }]
        });
      });
    });

    it('queries _all_docs with a partition key', () => {
      const partitionKey = 'key1';
      const params = {
        limit: 21,
        skip: 0,
        inclusive_end: false,
        start_key: `"${partitionKey}:"`,
        end_key: `"${partitionKey}:\ufff0"`
      };
      const fetchUrl = '/testdb/_all_docs';
      const query = app.utils.queryString(params);
      const url = `${fetchUrl}?${query}`;
      fetchMock.getOnce(url, docs);

      return queryAllDocs(fetchUrl, partitionKey, params).then((res) => {
        expect(res).toEqual({
          docType: Constants.INDEX_RESULTS_DOC_TYPE.VIEW,
          docs: [
            {
              id: "foo",
              key: "foo",
              value: {
                rev: "1-1390740c4877979dbe8998382876556c"
              }
            },
            {
              id: "foo2",
              key: "foo2",
              value: {
                rev: "2-1390740c4877979dbe8998382876556c"
              }
            }]
        });
      });
    });
  });

  describe('Bulk Delete', () => {
    describe('validation', () => {
      let selectedDocs;
      beforeEach(() => {
        selectedDocs = [
          {
            _id: 'foo',
            _rev: 'bar',
            _deleted: true
          }
        ];
      });

      it('validation fails if no docs selected', () => {
        selectedDocs = [];
        expect(validateBulkDelete(selectedDocs)).toBe(false);
      });

      it('validation fails if user does not wish to continue', () => {
        global.confirm = () => false;
        expect(validateBulkDelete(selectedDocs)).toBe(false);
      });

      it('validation succeeds otherwise', () => {
        global.confirm = () => true;
        expect(validateBulkDelete(selectedDocs)).toBe(true);
      });
    });

    describe('postToBulkDocs', () => {
      it('deletes list of docs', () => {
        const payload = {
          docs: [
            {
              _id: 'foo',
              _rev: 'bar',
              _deleted: true
            }
          ]
        };
        const res = [
          {
            "ok": true,
            "id":"foo",
            "rev":"2-fe3a51be430401d97872d14a40f590dd"
          }
        ];
        const databaseName = 'testdb';

        fetchMock.postOnce(FauxtonAPI.urls('bulk_docs', 'server', databaseName), res);
        return postToBulkDocs(databaseName, payload).then((json) => {
          expect(json).toEqual(res);
        });
      });
    });

    describe('processBulkDeleteResponse', () => {
      let notificationSpy, sidebarSpy;

      beforeEach(() => {
        notificationSpy = sinon.spy(FauxtonAPI, 'addNotification');
        sidebarSpy = sinon.stub(SidebarActions, 'dispatchUpdateDesignDocs');
      });

      afterEach(() => {
        notificationSpy.restore();
        sidebarSpy.restore();
      });

      it('creates two notifications when number of failed docs is positive', () => {
        const res = [
          {
            id: 'foo',
            error: 'conflict',
            reason: 'Document update conflict'
          }
        ];
        const originalDocs = [
          {
            _id: 'foo',
            _rev: 'bar',
            _deleted: true
          }
        ];
        const designDocs = [];
        processBulkDeleteResponse(res, originalDocs, designDocs);
        expect(notificationSpy.calledTwice).toBe(true);
        expect(sidebarSpy.calledOnce).toBe(false);
      });

      it('calls dispatchUpdateDesignDocs when one of the deleted docs is a ddoc', () => {
        const res = [
          {
            id: '_design/foo',
            rev: 'bar',
            ok: true
          }
        ];
        const originalDocs = [
          {
            _id: '_design/foo',
            _rev: 'bar',
            _deleted: true
          }
        ];
        const designDocs = ['_design/foo'];
        processBulkDeleteResponse(res, originalDocs, designDocs);
        expect(notificationSpy.calledOnce).toBe(true);
        expect(sidebarSpy.calledOnce).toBe(true);
      });
    });
  });
});
