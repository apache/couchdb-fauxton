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
  '../../../../test/mocha/testUtils',
  '../../../core/api',
  '../components'
], function (testUtils, FauxtonAPI, Components) {
  var assert = testUtils.assert;

  describe('DbSearchTypeahead', function () {

    // simple test to confirm that the query part of the URL and the \u9999 search end char
    // are URL encoded
    it('should URI encode parts of URL', function () {
      var dbLimit = 30;
      var typeahead = new Components.DbSearchTypeahead({
        dbLimit: dbLimit
      });
      var url = typeahead.getURL('querywith[]chars', dbLimit);

      // confirm the [] chars have been encoded
      assert.isTrue(/%5B%5D/.test(url));

      // confirm the \u9999 char has been encoded
      assert.isFalse(/\u9999/.test(url));
      assert.isTrue(/%E9%A6%99/.test(url));
    });
  });

});
