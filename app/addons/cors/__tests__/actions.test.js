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
import utils from "../../../../test/mocha/testUtils";
import FauxtonAPI from "../../../core/api";
import * as Actions from "../actions";
import * as CorsAPI from "../api";
import sinon from "sinon";

const assert = utils.assert;
const restore = utils.restore;

describe('CORS actions', () => {

  describe('save', () => {

    const localNode = 'node2@127.0.0.1';
    const baseURL = 'http://localhost:8000/#_config/couchdb@localhost/cors';
    const dispatch = sinon.stub();
    const spyUpdateEnableCorsToHttpd = sinon.stub(CorsAPI, 'updateEnableCorsToHttpd');
    const spyUpdateCorsOrigins = sinon.stub(CorsAPI, 'updateCorsOrigins');
    const spyUpdateCorsCredentials = sinon.stub(CorsAPI, 'updateCorsCredentials');
    const spyUpdateCorsHeaders = sinon.stub(CorsAPI, 'updateCorsHeaders');
    const spyUpdateCorsMethods = sinon.stub(CorsAPI, 'updateCorsMethods');

    afterEach(() => {
      restore(FauxtonAPI.Promise.all);
      restore(FauxtonAPI.addNotification);

      spyUpdateEnableCorsToHttpd.reset();
      spyUpdateCorsOrigins.reset();
      spyUpdateCorsCredentials.reset();
      spyUpdateCorsHeaders.reset();
      spyUpdateCorsMethods.reset();
    });

    it('should save enable_cors to httpd', () => {
      Actions.saveCors(baseURL, {
        corsEnabled: false,
        node: localNode
      })(dispatch);

      assert.ok(spyUpdateEnableCorsToHttpd.calledWith(baseURL, localNode, false));
    });

    it('does not save CORS origins if CORS is not enabled', () => {
      Actions.saveCors(baseURL, {
        corsEnabled: false,
        origins: ['*'],
        node: localNode
      })(dispatch);

      assert.notOk(spyUpdateCorsOrigins.called);
    });

    it('saves CORS origins', () => {
      Actions.saveCors(baseURL, {
        corsEnabled: true,
        origins: ['*'],
        node: localNode
      })(dispatch);

      assert.ok(spyUpdateCorsOrigins.calledWith(baseURL, localNode, '*'));
    });

    it('saves CORS credentials, headers and methods', () => {
      Actions.saveCors(baseURL, {
        corsEnabled: true,
        origins: ['https://testdomain.com'],
        node: localNode
      })(dispatch);

      assert.ok(spyUpdateCorsCredentials.calledOnce);
      assert.ok(spyUpdateCorsHeaders.calledOnce);
      assert.ok(spyUpdateCorsMethods.calledOnce);
    });

    it('shows notification on successful save', () => {
      const stub = sinon.stub(FauxtonAPI.Promise, 'all');
      const spyAddNotification = sinon.spy(FauxtonAPI, 'addNotification');
      const promise = FauxtonAPI.Promise.resolve();
      stub.returns(promise);

      return Actions.saveCors(baseURL, {
        enableCors: true,
        origins: ['https://testdomain.com'],
        node: localNode
      })(dispatch).then(() => {
        assert.ok(spyAddNotification.called);
      });
    });
  });

  describe('Sanitize origins', () => {

    it('joins array into string', () => {
      var origins = ['https://hello.com', 'https://hello2.com'];

      assert.deepEqual(Actions.sanitizeOrigins(origins), origins.join(','));
    });

    it('returns empty string for no origins', () => {
      var origins = [];

      assert.deepEqual(Actions.sanitizeOrigins(origins), '');
    });
  });
});
