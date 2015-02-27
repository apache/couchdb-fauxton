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
       'addons/documents/resources',
       'testUtils',
       'api'
], function (app, Views, Models, testUtils, FauxtonAPI) {
  var assert = testUtils.assert;

  describe('DatabasePaginate', function () {
    var totalPages, pageComponent, testObject, currentPage;

    beforeEach(function () {
      pageComponent = new Views.Pagination({page: 1});
    });

    it('Should return all the pages, if there are less than 10 total pages', function () {
      for (totalPages = 1; totalPages < 11; totalPages++) {
        for (currentPage = 1; currentPage < totalPages; currentPage++) {
          testObject = pageComponent.getVisiblePages(currentPage, totalPages);
          assert.deepEqual(testObject , {from: 1, to: totalPages + 1});
        }
      }
    });

    it('Should return only a ten page range, if more than 10 total pages', function () {
      var difference;
      for (totalPages = 10; totalPages < 50; totalPages++) {
        for (currentPage = totalPages; currentPage < totalPages; currentPage++) {
          testObject = pageComponent.getVisiblePages(currentPage, totalPages);
          difference = testObject.to - testObject.from;
          assert.equal(difference, 10);
        }
      }
    });

    it('Should return from 1 to 10, if accessing the first 6 pages', function () {
      totalPages = 50;
      for (currentPage = 1; currentPage <= 6; currentPage++) {
        testObject = pageComponent.getVisiblePages(currentPage, totalPages);
        assert.deepEqual(testObject , {from: 1, to: 11});
      }

    });

    it('Should return from totalpages-10 to totalPages, if accessing one of the last 4 pages', function () {
      totalPages = 50;
      for (currentPage = 46; currentPage <= totalPages; currentPage++) {
        testObject = pageComponent.getVisiblePages(currentPage, totalPages);
        assert.deepEqual(testObject , {from: 41, to: 51});
      }
    });

  });
});
