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
import {
  json,
  fetchObserver,
  get,
  put,
  post,
  deleteRequest
} from '../ajax';
import testUtils from "../../../test/mocha/testUtils";
const assert = testUtils.assert;

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

    unsubscribe = fetchObserver.filter(resp => resp.status === 400).subscribe({
      next (resp) {
        done();
        assert.deepEqual(resp.status, 400);
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
      assert.ok(resp.ok);
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
        assert.ok(resp.ok);
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
        assert.ok(resp.ok);
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
        assert.ok(resp.ok);
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
          assert.ok(resp.ok);
          assert.ok(fetchMock.lastOptions().body === '""');
        });
    });

    it('accepts zero', () => {
      fetchMock.postOnce('/testing', successResponse);
      return post('/testing', 0)
        .then(resp =>{
          assert.ok(resp.ok);
          assert.ok(fetchMock.lastOptions().body === '0');
        });
    });

    it('accepts false', () => {
      fetchMock.postOnce('/testing', successResponse);
      return post('/testing', false)
        .then(resp =>{
          assert.ok(resp.ok);
          assert.ok(fetchMock.lastOptions().body === 'false');
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
          assert.ok(resp.ok);
          assert.ok(fetchMock.lastOptions().body === '""');
        });
    });

    it('accepts zero', () => {
      fetchMock.putOnce('/testing', successResponse);
      return put('/testing', 0)
        .then(resp =>{
          assert.ok(resp.ok);
          assert.ok(fetchMock.lastOptions().body === '0');
        });
    });

    it('accepts false', () => {
      fetchMock.putOnce('/testing', successResponse);
      return put('/testing', false)
        .then(resp =>{
          assert.ok(resp.ok);
          assert.ok(fetchMock.lastOptions().body === 'false');
        });
    });
  });
});
