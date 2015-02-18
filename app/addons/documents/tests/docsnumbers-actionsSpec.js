define([
  'api',
  'addons/documents/docs-list/actions',
  'addons/documents/docs-list/stores',
  'testUtils',
], function (FauxtonAPI, Actions, Stores, testUtils) {
  var assert = testUtils.assert;

  FauxtonAPI.router = new FauxtonAPI.Router([]);

  describe('All Docs Numbers Actions', function () {

    describe('updatePerPage', function () {
      var pagination;

      beforeEach(function () {
        pagination = {
          updatePerPage: function () {},
          documentsLeftToFetch: function () { return 30; }
        };
      });

      afterEach(function () {
        Stores.allDocsListStore.getPagination.restore();
        FauxtonAPI.triggerRouteEvent.restore();
      });

      it('triggers routeEvent', function () {
        var stub = sinon.stub(Stores.allDocsListStore, 'getPagination');
        stub.returns(pagination);
        var spy = sinon.spy(FauxtonAPI, 'triggerRouteEvent');
        Actions.updatePerPage(30);

        assert.ok(spy.calledWith('perPageChange', 30));
      });
    });
  });
});
