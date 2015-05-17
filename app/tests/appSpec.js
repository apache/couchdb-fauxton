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
        FauxtonAPI._backdoorDeferred = null;
      });

      it('caches content', function (done) {
        server.respondWith('GET', 'http://example.com/_cluster_setup',
            [200, { "Content-Type": "application/json" },
             '[{ "id": 12, "comment": "Hey there" }]']);

        var spyAjax = sinon.spy($, 'ajax');
        var promise = FauxtonAPI.isRunningOnBackdoorPort();
        server.respond();

        promise.then(function (res) {
          var promise2 = FauxtonAPI.isRunningOnBackdoorPort();
          promise2.then(function (res) {

            assert.ok(spyAjax.calledOnce);
            done();
          });
        });
      });

      it('returns false on a 401', function (done) {
        server.respondWith('GET', 'http://example.com/_cluster_setup',
            [401, { "Content-Type": "application/json" }, '']);

        var promise = FauxtonAPI.isRunningOnBackdoorPort();
        server.respond();

        promise.then(function (res) {
          assert.deepEqual({runsOnBackportPort: false}, res);
          done();
        });
      });

      it('returns false on a 200', function (done) {
        server.respondWith('GET', 'http://example.com/_cluster_setup',
            [200, { "Content-Type": "application/json" }, '']);

        var promise = FauxtonAPI.isRunningOnBackdoorPort();
        server.respond();

        promise.then(function (res) {
          assert.deepEqual({runsOnBackportPort: false}, res);
          done();
        });
      });


      it('returns true on a 400', function (done) {
        server.respondWith('GET', 'http://example.com/_cluster_setup',
            [400, {'Content-Type': 'application/json' },
             '[{ "id": 12, "comment": "Hey there" }]']);

        var promise = FauxtonAPI.isRunningOnBackdoorPort();
        server.respond();

        promise.then(function (res) {
          assert.deepEqual({runsOnBackportPort: true}, res);
          done();
        });
      });
    });
  });
});
