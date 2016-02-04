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
  '../../../core/api',
  '../base',
  '../routes',
  '../header/header.actions',
  '../index-results/actions',
  '../../../../test/mocha/testUtils',
], function (FauxtonAPI, Base, Documents, HeaderActions, IndexResultsActions, testUtils) {
  var assert = testUtils.assert;
  var DocumentRoute = Documents.RouteObjects[2];

  //commenting out for now. This test adds little value and is breaking the routeObjectSpecs
  describe('Documents Route', function () {

    /*it('the all-documents-list has a right header', function () {
       var routeObj = new DocumentRoute(null, null, ['test']);

       routeObj.allDocs('newdatabase', null);
      assert.equal(typeof routeObj.rightHeader, 'object');

    });*/

  });

  //    until there is consensus on how to encode json responses
  //    https://issues.apache.org/jira/browse/COUCHDB-2748
  //    taking out this test for https://github.com/apache/couchdb-fauxton/pull/489

  //describe('Fauxton Urls', function () {
    // it('document app encodes document id', function () {
    //   var id = "\foo";
    //   var url = FauxtonAPI.urls('document', 'app', 'fake-db', id);
    //   assert.deepEqual("/database/fake-db/%0Coo", url);
    // });
  //});
});
