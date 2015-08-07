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
  'testUtils'
], function (app, FauxtonAPI, testUtils) {
  var assert = testUtils.assert;

  describe('csrf tokens', function () {
    var xhr, request;
    beforeEach(function () {
      xhr = sinon.useFakeXMLHttpRequest();
      xhr.onCreate = function (xhr) {
        request = xhr;
      };
    });

    afterEach(function () {
      testUtils.restore(xhr);
    });

    it('asks for a CSRF token', function (done) {
      $.ajax({
        type: 'GET',
        url: 'http://example.com'
      }).done(function () {
        assert.equal(request.requestHeaders['X-CouchDB-CSRF'], 'true');
        done();
      });
      request.respond(200, {
        'Content-Type': 'application/json'
      }, '[{ "id": 12, "comment": "Hey there" }]');
    });

  });
});
