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
  '../resources',
  '../../../../test/mocha/testUtils',
], function (FauxtonAPI, Resources, testUtils) {
  var assert = testUtils.assert,
      ViewSandbox = testUtils.ViewSandbox;

  describe("Databases: List", function () {

    describe("List items", function () {

      it("detects graveyards", function () {
        var modelWithGraveYard = new Resources.Status({
          doc_count: 5,
          doc_del_count: 6
        });
        var modelWithoutGraveYard = new Resources.Status({
          doc_count: 6,
          doc_del_count: 5
        });
        assert.ok(modelWithGraveYard.isGraveYard());
        assert.ok(!modelWithoutGraveYard.isGraveYard());
      });

      it("can tell whether the data size showing is accurate or not", function () {
        var modelWithDataSize = new Resources.Status({
          other: 6,
          data_size: 5,
          disk_size: 2
        });
        assert.ok(modelWithDataSize.hasDataSize());

        var empty_probably_fetching_model = new Resources.Status({});
        assert.notOk(empty_probably_fetching_model.hasDataSize());
      });

    });

    describe('List of Databases', function () {
      it('returns the names of databases in a list in an array', function () {
        var listCollection = new Resources.List([{
          name: 'ente'
        },
        {
          name: 'rocko'
        }]);
        var databaseNames = listCollection.getDatabaseNames();

        assert.equal(databaseNames[0], 'ente');
        assert.equal(databaseNames[1], 'rocko');
      });
    });
  });
});
