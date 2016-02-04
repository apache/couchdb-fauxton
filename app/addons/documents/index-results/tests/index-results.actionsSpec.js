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
  '../../../../core/api',
  '../actions',
  '../stores',
  '../../resources',
  '../../sidebar/actions',
  '../../../../../test/mocha/testUtils',
  '../../tests/document-test-helper',

], function (FauxtonAPI, Actions, Stores, Documents, SidebarActions, testUtils, documentTestHelper) {
  var assert = testUtils.assert;
  var restore = testUtils.restore;
  var store;

  var createDocColumn = documentTestHelper.createDocColumn;

  describe('#deleteSelected', function () {
    var confirmStub;
    var bulkDeleteCollection;

    beforeEach(function () {
      Stores.indexResultsStore = new Stores.IndexResultsStore();
      Stores.indexResultsStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.indexResultsStore.dispatch);
      store = Stores.indexResultsStore;
      store.reset();

      bulkDeleteCollection = new Documents.BulkDeleteDocCollection([], {databaseId: '1'});
      store._bulkDeleteDocCollection = bulkDeleteCollection;
      store._collection = createDocColumn([{_id: 'testId1'}, {_id: 'testId2'}]);

      store._selectedItems = {
        'testId1': true,
        'testId2': true
      };

      confirmStub = sinon.stub(window, 'confirm');
      confirmStub.returns(true);

    });

    afterEach(function () {
      restore(window.confirm);
      restore(FauxtonAPI.addNotification);
      restore(Actions.reloadResultsList);
      restore(SidebarActions.refresh);
      restore(Actions.newResultsList);
    });

    it('doesn\'t delete if user denies confirmation', function () {
      window.confirm.restore();

      var stub = sinon.stub(window, 'confirm');
      stub.returns(false);

      var spy = sinon.spy(bulkDeleteCollection, 'bulkDelete');

      Actions.deleteSelected(bulkDeleteCollection, 1);

      assert.notOk(spy.calledOnce);
    });

    it('on success notifies all deleted', function (done) {
      var spy = sinon.spy(FauxtonAPI, 'addNotification');
      var sidebarSpy = sinon.spy(SidebarActions, 'refresh');
      var promise = FauxtonAPI.Deferred();
      var ids = {
        errorIds: []
      };
      var bulkDelete = {
        bulkDelete: function () {
          promise.resolve(ids);
          return promise;
        },
        reset: function () {
          done();
        }
      };

      var reloadResultsListStub = sinon.stub(Actions, 'reloadResultsList');
      var stubPromise = FauxtonAPI.Deferred();
      stubPromise.resolve();
      reloadResultsListStub.returns(stubPromise);

      Actions.deleteSelected(bulkDelete, 1);

      assert.ok(spy.calledOnce);
      assert.ok(sidebarSpy.calledOnce);
    });
  });
});
