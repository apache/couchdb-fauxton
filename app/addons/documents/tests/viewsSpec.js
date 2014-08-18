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
        'addons/documents/views',
        'addons/documents/resources',
        'addons/databases/base',
        'testUtils'
], function (Views, Resources, Databases, testUtils) {
  var assert = testUtils.assert,
      ViewSandbox = testUtils.ViewSandbox,
      viewSandbox;

  describe('AllDocsList', function () {
    var database = new Databases.Model({id: 'registry'}),
        bulkDeleteDocCollection = new Resources.BulkDeleteDocCollection([], {databaseId: 'registry'});

    database.allDocs = new Resources.AllDocs({_id: "ente"}, {
      database: database,
      viewMeta: {update_seq: 1},
      params: {}
    });

    var view = new Views.Views.AllDocsList({
      viewList: false,
      bulkDeleteDocsCollection: bulkDeleteDocCollection,
      collection: database.allDocs
    });

    beforeEach(function (done) {
      viewSandbox = new ViewSandbox();
      viewSandbox.renderView(view, done);
    });

    afterEach(function () {
      viewSandbox.remove();
    });

    it('should load', function () {
      assert.equal(typeof Views.Views.AllDocsList, 'function');
    });

    it('pressing SelectAll should fill the delete-bulk-docs-collection', function () {
      assert.equal(bulkDeleteDocCollection.length, 0);
      view.$('button.all').trigger('click');
      assert.equal(bulkDeleteDocCollection.length, 1);
    });
  });
});
