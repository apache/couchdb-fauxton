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
      'api',
      'addons/indexes/resources',
      'testUtils'
], function (FauxtonAPI, Resources, testUtils) {
  var assert = testUtils.assert,
      ViewSandbox = testUtils.ViewSandbox;

  describe('Indexes: ViewRow', function () {
    it('returns the doctype', function () {
      var designDoc = new Resources.ViewRow({_id: '_design/foo'});

      assert.equal(designDoc.docType(), 'design doc');
    });
  });
});
