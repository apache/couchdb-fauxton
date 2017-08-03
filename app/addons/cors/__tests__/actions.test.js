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
import sinon from "sinon";

const assert = utils.assert;
const restore = utils.restore;

describe('CORS actions', () => {

  describe('save', () => {

    let localNode = 'node2@127.0.0.1';

    afterEach(() => {
      restore(Actions.saveCorsOrigins);

      restore(FauxtonAPI.when);
      restore(FauxtonAPI.addNotification);
    });

    it('should save cors enabled to httpd', () => {
      var spy = sinon.spy(Actions, 'saveEnableCorsToHttpd');

      Actions.saveCors({
        enableCors: false,
        node: localNode
      });

      assert.ok(spy.calledWith(false));
    });

    it('does not save cors origins if cors not enabled', () => {
      var spy = sinon.spy(Actions, 'saveCorsOrigins');

      Actions.saveCors({
        enableCors: false,
        origins: ['*'],
        node: localNode
      });

      assert.notOk(spy.calledOnce);
    });

    it('saves cors origins', () => {
      var spy = sinon.spy(Actions, 'saveCorsOrigins');

      Actions.saveCors({
        enableCors: true,
        origins: ['*'],
        node: localNode
      });

      assert.ok(spy.calledWith('*'));
    });

    it('saves cors allow credentials', () => {
      var spy = sinon.spy(Actions, 'saveCorsCredentials');

      Actions.saveCors({
        enableCors: true,
        origins: ['https://testdomain.com'],
        node: localNode
      });

      assert.ok(spy.calledOnce);
    });

    it('saves cors headers', () => {
      var spy = sinon.spy(Actions, 'saveCorsHeaders');

      Actions.saveCors({
        enableCors: true,
        origins: ['https://testdomain.com'],
        node: localNode
      });

      assert.ok(spy.calledOnce);
    });

    it('saves cors methods', () => {
      var spy = sinon.spy(Actions, 'saveCorsMethods');

      Actions.saveCors({
        enableCors: true,
        origins: ['https://testdomain.com'],
        node: localNode
      });

      assert.ok(spy.calledOnce);

    });

    it('shows notification on successful save', () => {
      var stub = sinon.stub(FauxtonAPI, 'when');
      var spy = sinon.spy(FauxtonAPI, 'addNotification');
      var promise = FauxtonAPI.Deferred();
      promise.resolve();
      stub.returns(promise);

      Actions.saveCors({
        enableCors: true,
        origins: ['https://testdomain.com'],
        node: localNode
      });

      assert.ok(spy.calledOnce);
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
