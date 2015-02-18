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
