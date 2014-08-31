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
       'addons/fauxton/components',
       'testUtils'
], function (app, Components, testUtils) {
  var assert = testUtils.assert;

  describe('ApiBarView', function () {
    var apiBar;

    beforeEach(function () {
      apiBar = new Components.ApiBar();
    });

    it('should get a location', function () {
      var stub = sinon.stub(apiBar, "getLocation");
      stub.returns("http://example.com");

      var location = apiBar.getEndPointAbsoluteUrl('../../_stats');
      assert.equal(location, 'http://example.com/_stats');
    });
  });
});
