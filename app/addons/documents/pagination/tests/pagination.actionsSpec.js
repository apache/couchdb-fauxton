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
  'addons/documents/pagination/actions',
  'addons/documents/pagination/stores',
  'testUtils',
], function (FauxtonAPI, Actions, Stores, testUtils) {
  var assert = testUtils.assert;

  FauxtonAPI.router = new FauxtonAPI.Router([]);

  describe('Pagination Actions', function () {

    afterEach(function () {
      Stores.indexPaginationStore.documentsLeftToFetch.restore && Stores.indexPaginationStore.documentsLeftToFetch.restore();
      Stores.indexPaginationStore.getCurrentPage.restore && Stores.indexPaginationStore.getCurrentPage.restore();
      Stores.indexPaginationStore.getPerPage.restore && Stores.indexPaginationStore.getPerPage.restore();
      FauxtonAPI.triggerRouteEvent.restore();
    });

    describe('updatePerPage', function () {

      it('triggers routeEvent', function () {
        var stub = sinon.stub(Stores.indexPaginationStore, 'documentsLeftToFetch');
        stub.returns(30);
        var spy = sinon.spy(FauxtonAPI, 'triggerRouteEvent');
        Actions.updatePerPage(30);

        assert.ok(spy.calledWith('perPageChange', 30));
      });
    });

    describe('paginateNext', function () {

      it('triggers routeEvent', function () {
        var spyEvent = sinon.spy(FauxtonAPI, 'triggerRouteEvent');
        var spyDocuments = sinon.spy(Stores.indexPaginationStore, 'documentsLeftToFetch');
        var spyPage = sinon.spy(Stores.indexPaginationStore, 'getCurrentPage');
        Actions.paginateNext();

        assert.ok(spyEvent.calledOnce);
        assert.ok(spyDocuments.calledOnce);
        assert.ok(spyPage.calledOnce);
      });

    });

    describe('paginatePrevious', function () {

      it('triggers routeEvent', function () {
        var spyEvent = sinon.spy(FauxtonAPI, 'triggerRouteEvent');
        var spyPerPage = sinon.spy(Stores.indexPaginationStore, 'getPerPage');
        var spyPage = sinon.spy(Stores.indexPaginationStore, 'getCurrentPage');
        Actions.paginatePrevious();

        assert.ok(spyEvent.calledOnce);
        assert.ok(spyPerPage.called);
        assert.ok(spyPage.calledOnce);
      });

    });
  });

});
