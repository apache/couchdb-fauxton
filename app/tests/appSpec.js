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
  'api',
  'testUtils',
], function (app, FauxtonAPI, testUtils) {
  var assert = testUtils.assert;

  describe('app', function () {

    describe('isRunningOnBackdoorPort', function () {
      var server, appHost;
      beforeEach(function () {
        appHost = app.host;
        app.host = 'http://example.com';
        server = sinon.fakeServer.create();
      });
      afterEach(function () {
        app.host = appHost;
        testUtils.restore(server);
        testUtils.restore($.ajax);
        testUtils.restore(FauxtonAPI.utils.sessionStorageGet);
      });

      it('caches content', function (done) {
        server.respondWith('GET', 'http://example.com/_config',
            [200, { "Content-Type": "application/json" },
             '[{ "id": 12, "comment": "Hey there" }]']);

        var spyAjax = sinon.spy($, 'ajax');
        var stub = sinon.stub(FauxtonAPI.utils, 'sessionStorageGet').returns(null);
        var promise = FauxtonAPI.isRunningOnBackdoorPort();
        server.respond();

        FauxtonAPI.when(promise).then(function (res) {
          testUtils.restore(FauxtonAPI.utils.sessionStorageGet);
          var promise2 = FauxtonAPI.isRunningOnBackdoorPort();
          FauxtonAPI.when(promise2).then(function (res) {
            assert.ok(spyAjax.calledOnce);
            done();
          });
        });
      });

      it('returns false on a 404', function (done) {
        server.respondWith('GET', 'http://example.com/_config',
            [404, { "Content-Type": "application/json" }, '']);

        var stub = sinon.stub(FauxtonAPI.utils, 'sessionStorageGet').returns(null);
        var promise = FauxtonAPI.isRunningOnBackdoorPort();
        server.respond();

        FauxtonAPI.when(promise).then(function (res) {
          assert.deepEqual({runsOnBackportPort: false}, res);
          done();
        });
      });

      it('returns true on a 200', function (done) {
        server.respondWith('GET', 'http://example.com/_config',
            [200, {'Content-Type': 'application/json' },
             '[{ "id": 12, "comment": "Hey there" }]']);

        var stub = sinon.stub(FauxtonAPI.utils, 'sessionStorageGet').returns(null);
        var promise = FauxtonAPI.isRunningOnBackdoorPort();
        server.respond();

        FauxtonAPI.when(promise).then(function (res) {
          assert.deepEqual({runsOnBackportPort: true}, res);
          done();
        });
      });
    });
  });
});
