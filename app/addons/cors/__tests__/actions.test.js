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
import Actions from "../actions";
import * as CorsAPI from "../api";
import sinon from "sinon";

const restore = utils.restore;

describe('CORS actions', () => {

  describe('save', () => {

    const localNode = 'node2@127.0.0.1';
    const baseURL = 'http://localhost:8000/#_config/couchdb@localhost/cors';
    const dispatch = sinon.stub();
    const spyUpdateEnableCorsToHttpd = sinon.stub(CorsAPI, 'updateEnableCorsToChttpd');
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

      expect(spyUpdateEnableCorsToHttpd.calledWith(baseURL, localNode, false)).toBeTruthy();
    });

    it('does not save CORS origins if CORS is not enabled', () => {
      Actions.saveCors(baseURL, {
        corsEnabled: false,
        origins: ['*'],
        node: localNode
      })(dispatch);

      expect(spyUpdateCorsOrigins.called).toBeFalsy();
    });

    it('saves CORS origins', () => {
      Actions.saveCors(baseURL, {
        corsEnabled: true,
        origins: ['*'],
        node: localNode
      })(dispatch);

      expect(spyUpdateCorsOrigins.calledWith(baseURL, localNode, '*')).toBeTruthy();
    });

    it('saves CORS credentials, headers and methods', () => {
      Actions.saveCors(baseURL, {
        corsEnabled: true,
        origins: ['https://testdomain.com'],
        node: localNode
      })(dispatch);

      expect(spyUpdateCorsCredentials.calledOnce).toBeTruthy();
      expect(spyUpdateCorsHeaders.calledOnce).toBeTruthy();
      expect(spyUpdateCorsMethods.calledOnce).toBeTruthy();
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
        expect(spyAddNotification.called).toBeTruthy();
      });
    });
  });

  describe('Sanitize origins', () => {

    it('joins array into string', () => {
      var origins = ['https://hello.com', 'https://hello2.com'];

      expect(Actions.sanitizeOrigins(origins)).toEqual(origins.join(','));
    });

    it('returns empty string for no origins', () => {
      var origins = [];

      expect(Actions.sanitizeOrigins(origins)).toEqual('');
    });
  });
});
