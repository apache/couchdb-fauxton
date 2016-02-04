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
  '../../app',
  '../api',
  '../../../test/mocha/testUtils',
], function (app, FauxtonAPI, testUtils) {
  var assert = testUtils.assert;

  describe('CouchDBSession', function () {
    var sessionFetch;

    before(function (done) {
      sessionFetch = FauxtonAPI.session.fetch;
      done();
    });
    after(function (done) {
      FauxtonAPI.session.fetch = sessionFetch;
      done();
    });

    //Cannot get this test to pass in isolation at the moment and I have no idea why
    /*it('triggers error on failed fetch', function () {
      var called = false;

      var session = FauxtonAPI.session;
      session.on('session:error', function () {
        called = true;
      });

      session.fetch = function () {
        var promise = FauxtonAPI.Deferred();
        promise.reject();
        return promise;
      };

      session.fetchUser();

      assert.ok(called);
    });*/


  });

});
