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
        'addons/documents/routes',
        'testUtils'
], function (Documents, testUtils) {
  var assert = testUtils.assert;
  var DocumentRoute = Documents.RouteObjects[2];

  describe('Documents Route', function () {

    it('the all-documents-list has a right header', function () {
      var routeObj = new DocumentRoute(null, null, ['test']);

      routeObj.allDocs('newdatabase', null);
      assert.equal(typeof routeObj.rightHeader, 'object');
    });

    // after saving a new CouchDB-View we are calling the updateAllDocsFromView function.
    // The backbone-view AllDocsList is lazily initializing other views, in particular the
    // view AllDocsNumber and the pagination in the beforeRender method.
    // That means the we can not access .setCollection and .perPage from outside
    // before we render the view.
    it('does not fail because of lazy initializing race conditions', function () {
      var routeObj = new DocumentRoute(null, null, ['test']);
      routeObj.updateAllDocsFromView({ddoc: "_design/asdfsadf", view: "newView"});

      assert.equal(typeof routeObj.documentsView, 'object');
    });
  });
});
