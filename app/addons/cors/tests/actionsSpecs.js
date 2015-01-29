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
define([
  'app',
  'testUtils',
  'api',
  'addons/cors/actions',
], function (app, testUtils, FauxtonAPI, Actions) {
  var assert = testUtils.assert;

  describe('CORS actions', function () {

    describe('save', function () {

      afterEach(function () {
        Actions.saveCorsOrigins.restore && Actions.saveCorsOrigins.restore();
      });

      it('should save cors enabled to httpd', function () {
        var spy = sinon.spy(Actions, 'saveEnableCorsToHttpd');

        Actions.saveCors({
          enableCors: false
        });

        assert.ok(spy.calledWith(false));
      });

      it('does not save cors origins if cors not enabled', function () {
        var spy = sinon.spy(Actions, 'saveCorsOrigins');

        Actions.saveCors({
          enableCors: false,
          origins: ['*']
        });

        assert.notOk(spy.calledOnce);
      });

      it('saves cors origins', function () {
        var spy = sinon.spy(Actions, 'saveCorsOrigins');

        Actions.saveCors({
          enableCors: true,
          origins: ['*']
        });

        assert.ok(spy.calledWith('*'));
      });

      it('saves cors allow credentials', function () {
        var spy = sinon.spy(Actions, 'saveCorsCredentials');

        Actions.saveCors({
          enableCors: true,
          origins: ['https://testdomain.com']
        });

        assert.ok(spy.calledOnce);
      });

      it('saves cors headers', function () {
        var spy = sinon.spy(Actions, 'saveCorsHeaders');

        Actions.saveCors({
          enableCors: true,
          origins: ['https://testdomain.com']
        });

        assert.ok(spy.calledOnce);
      });

      it('saves cors methods', function () {
        var spy = sinon.spy(Actions, 'saveCorsMethods');

        Actions.saveCors({
          enableCors: true,
          origins: ['https://testdomain.com']
        });

        assert.ok(spy.calledOnce);

      });

      it('shows notification on successful save', function () {
        var stub = sinon.stub(FauxtonAPI, 'when');
        var spy = sinon.spy(FauxtonAPI, 'addNotification');
        var promise = FauxtonAPI.Deferred();
        promise.resolve();
        stub.returns(promise);

        Actions.saveCors({
          enableCors: true,
          origins: ['https://testdomain.com']
        });

        assert.ok(spy.calledOnce);
        FauxtonAPI.when.restore();
        FauxtonAPI.addNotification.restore();
      });

      it('dispatches CORS_SAVED', function () {
        var stub = sinon.stub(FauxtonAPI, 'when');
        var called = false;
        var promise = FauxtonAPI.Deferred();
        promise.resolve();
        stub.returns(promise);

        FauxtonAPI.dispatcher.register(function (actions) {

          if (actions.type === 'CORS_SAVED') {
            called = true;
          }

        });

        Actions.saveCors({
          enableCors: true,
          origins: ['https://testdomain.com']
        });

        assert.ok(called);
        FauxtonAPI.when.restore();
      });

    });

    describe('Sanitize origins', function () {

      it('joins array into string', function () {
        var origins = ['https://hello.com', 'https://hello2.com'];

        assert.deepEqual(Actions.sanitizeOrigins(origins), origins.join(','));
      });

      it('returns empty string for no origins', function () {
        var origins = [];

        assert.deepEqual(Actions.sanitizeOrigins(origins), '');
      });
    });
  });

});
