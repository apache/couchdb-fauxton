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
import { filter } from 'rxjs/operators';
import {
  json,
  fetchObserver,
  get,
  put,
  post,
  deleteRequest,
  setPreFetchFn,
  defaultPreFetch,

} from '../ajax';

describe('Fauxton Ajax', () => {
  let unsubscribe;

  afterEach(() => {
    if (unsubscribe) {
      unsubscribe.unsubscribe();
      unsubscribe = null;
    }
    fetchMock.reset();
  });

  it('should observe multiple requests', (done) => {
    fetchMock.getOnce('/testing', {
      status: 200,
      body: {
        ok: true
      }
    });

    fetchMock.getOnce('/testing2', {
      status: 201,
      body: {
        ok: true
      }
    });

    let count = 0;
    unsubscribe = fetchObserver.subscribe({
      next () {
        count++;
        if (count === 2) {
          done();
        }
      }
    });

    json("/testing");
    json("/testing2");
  });

  it('Observer should be filterable', (done) => {
    fetchMock.getOnce('/testing', {
      status: 200,
      body: {
        ok: true
      }
    });

    fetchMock.getOnce('/testing-again', {
      status: 400,
      body: {
        hello: 'ok'
      }
    });

    unsubscribe = fetchObserver.pipe(filter(resp => resp.status === 400)).subscribe({
      next (resp) {
        done();
        expect(resp.status).toEqual(400);
      }
    });

    json("/testing");
    json("/testing-again");
  });

  it('can do a GET', () => {
    fetchMock.getOnce('/testing', {
      status: 200,
      body: {
        ok: true
      }
    });

    return get('/testing').then(resp =>{
      expect(resp.ok).toBeTruthy();
    });
  });

  it('can do a PUT', () => {
    fetchMock.putOnce('/testing', {
      status: 200,
      body: {
        ok: true
      }
    });

    return put('/testing')
      .then(resp =>{
        expect(resp.ok).toBeTruthy();
      });
  });

  it('can do a POST', () => {
    fetchMock.postOnce('/testing', {
      status: 200,
      body: {
        ok: true
      }
    });

    return post('/testing')
      .then(resp =>{
        expect(resp.ok).toBeTruthy();
      });
  });

  it('can do a DELETE', () => {
    fetchMock.deleteOnce('/testing', {
      status: 200,
      body: {
        ok: true
      }
    });

    return deleteRequest('/testing')
      .then(resp =>{
        expect(resp.ok).toBeTruthy();
      });
  });

  describe('POST with falsy values as the body', () => {
    const successResponse = {
      status: 200,
      body: {
        ok: true
      }
    };
    it('accepts empty string', () => {
      fetchMock.postOnce('/testing', successResponse);
      return post('/testing', '')
        .then(resp =>{
          expect(resp.ok).toBeTruthy();
          expect(fetchMock.lastOptions().body).toBe('""');
        });
    });

    it('accepts zero', () => {
      fetchMock.postOnce('/testing', successResponse);
      return post('/testing', 0)
        .then(resp =>{
          expect(resp.ok).toBeTruthy();
          expect(fetchMock.lastOptions().body).toBe('0');
        });
    });

    it('accepts false', () => {
      fetchMock.postOnce('/testing', successResponse);
      return post('/testing', false)
        .then(resp =>{
          expect(resp.ok).toBeTruthy();
          expect(fetchMock.lastOptions().body).toBe('false');
        });
    });
  });

  describe('PUT with falsy values as the body', () => {
    const successResponse = {
      status: 200,
      body: {
        ok: true
      }
    };
    it('accepts empty string', () => {
      fetchMock.putOnce('/testing', successResponse);
      return put('/testing', '')
        .then(resp =>{
          expect(resp.ok).toBeTruthy();
          expect(fetchMock.lastOptions().body).toBe('""');
        });
    });

    it('accepts zero', () => {
      fetchMock.putOnce('/testing', successResponse);
      return put('/testing', 0)
        .then(resp =>{
          expect(resp.ok).toBeTruthy();
          expect(fetchMock.lastOptions().body).toBe('0');
        });
    });

    it('accepts false', () => {
      fetchMock.putOnce('/testing', successResponse);
      return put('/testing', false)
        .then(resp =>{
          expect(resp.ok).toBeTruthy();
          expect(fetchMock.lastOptions().body).toBe('false');
        });
    });
  });

  describe('pre-fetch function', () => {
    afterEach(() => {
      setPreFetchFn(defaultPreFetch);
    });

    const successResponse = {
      status: 200,
      body: {
        ok: true
      }
    };
    it('by default calls fetch with the same params', () => {
      fetchMock.postOnce('/testing', successResponse);
      return post('/testing', JSON.stringify({a: 123}), {extraOption: 'foo'})
        .then(resp =>{
          expect(resp.ok).toBeTruthy();
          expect(fetchMock.lastOptions().extraOption).toEqual('foo');
        });
    });

    it('is called and then fetch is called', () => {
      fetchMock.postOnce('/testing_transformed', successResponse);
      let prefetchCalled = false;
      const mockPreFetch = (url, options) => {
        prefetchCalled = true;
        return Promise.resolve({url: url + '_transformed', options});
      };
      setPreFetchFn(mockPreFetch);
      return post('/testing', JSON.stringify({a: 123}))
        .then(resp =>{
          expect(prefetchCalled).toEqual(true);
          expect(resp.ok).toBeTruthy();
          expect(fetchMock.lastOptions().body).toBe('"{\\"a\\":123}"');
        });
    });

    it('fails when trying to set an invalid function or null/undefined', () => {
      const caseNotFunction = () => { setPreFetchFn('not a function'); };
      expect(caseNotFunction).toThrow();
      const caseNull = () => { setPreFetchFn(null); };
      expect(caseNull).toThrow();
      const caseUndefined = () => { setPreFetchFn(undefined); };
      expect(caseUndefined).toThrow();
      const caseInvalidFunction = () => { setPreFetchFn((onlyOneParam) => { return onlyOneParam; }); };
      expect(caseInvalidFunction).toThrow();
    });
  });
});
