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
  "app",
  "testUtils"
], function (app, testUtils) {
  var assert = testUtils.assert;

  describe("utils", function () {
    describe("safeURLName", function () {
      it("should encode urls with a % (COUCHDB-2342)", function () {
        var res = app.utils.safeURLName("design%20foo");
        assert.equal(res, "design%2520foo");
      });
    });
  });
});
