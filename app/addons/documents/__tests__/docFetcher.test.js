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

import docFetcher from '../rev-browser/docFetcher';
import fetchMock from 'fetch-mock';

describe('docFetcher', () => {

  describe('constructor', () => {
    it('throws with an invalid db URL', () => {
      expect(() => {
        docFetcher('not_a_url');
      }).toThrow('Invalid database URL: not_a_url');

      expect(() => {
        docFetcher(null);
      }).toThrow('Invalid database URL: null');
    });
  });

  describe('getDoc', () => {
    const dbURL = 'http://localhost/testdb';
    const docID = 'doc1';
    const docURL = `${dbURL}/${docID}`;
    const mockDoc = {
      _id: '1234',
      _rev: '1-fdsafdsa',
      afield: 'avalue'
    };

    it('resolves the json doc', () => {
      const fetcher = docFetcher(dbURL);
      fetchMock.getOnce(docURL, mockDoc);

      return fetcher.getDoc(docID).then(doc => {
        expect(doc).toEqual(mockDoc);
      });
    });

    it('fetches with the given params', () => {
      const fetcher = docFetcher(dbURL);
      fetchMock.getOnce(docURL + '?revs=true&rev=2-abc', mockDoc);

      return fetcher.getDoc(docID, {revs: true, rev:'2-abc'}).then(doc => {
        expect(doc).toEqual(mockDoc);
      });
    });

    it('rejects in case of error', () => {
      const fetcher = docFetcher(dbURL);
      const url = `${dbURL}/docNotFound`;
      fetchMock.getOnce(url, {
        body:  {error: 'not_found', reason: 'doc not found'},
        status: 404
      });

      return fetcher.getDoc('docNotFound').then(() => {
        fail('Should not succeed');
      }).catch(err => {
        expect(err.message).toEqual('not_found');
      });
    });

    it('rejects when given an invalid doc ID', () => {
      const fetcher = docFetcher(dbURL);
      return fetcher.getDoc('').then(() => {
        fail('Should not succeed');
      }).catch(err => {
        expect(err.message).toEqual('Invalid document ID');
      });
    });

  });
});
