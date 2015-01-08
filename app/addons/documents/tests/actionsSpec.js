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
  'addons/documents/actions',
  'addons/documents/resources',
  'addons/documents/actiontypes',
  'testUtils'
], function (FauxtonAPI, Actions, Documents, ActionTypes, testUtils) {
  var expect = testUtils.chai.expect;

  FauxtonAPI.router = new FauxtonAPI.Router([]);

  describe('Index Editor Actions', function () {
    var database = {
      safeID: function () { return 'id';}
    };

    describe('save view', function () {
      var designDoc, designDocs;
      beforeEach(function () {
        designDoc = {
          _id: '_design/test-doc',
          views: {
            'test-view': {
              map: 'function () {};',
            }
          }
        };

        designDocs = new Documents.AllDocs([designDoc], {
          params: { limit: 10 },
          database: database
        });
      });

      afterEach(function () {
        FauxtonAPI.navigate.restore && FauxtonAPI.navigate.restore();
        FauxtonAPI.triggerRouteEvent.restore && FauxtonAPI.triggerRouteEvent.restore();
      });

      it('shows a notification if no design doc id given', function () {
        var spy = sinon.spy(FauxtonAPI, 'addNotification');

        var viewInfo = {
          database: database,
          viewName: 'new-doc',
          designDocId: undefined,
          map: 'map',
          reduce: '_sum',
          newDesignDoc: true,
          newView: true
        };

        Actions.saveView(viewInfo, designDocs);
        expect(spy.calledOnce).to.be.true;
        FauxtonAPI.addNotification.restore();
      });

      it('creates new design Doc for new design doc', function () {
        var spy = sinon.spy(Actions.helpers, 'createNewDesignDoc');

        var viewInfo = {
          database: database,
          viewName: 'new-doc',
          designDocId: '_design/test-doc',
          map: 'map',
          reduce: '_sum',
          newDesignDoc: true,
          newView: true
        };

        Actions.saveView(viewInfo, designDocs);
        expect(spy.calledOnce).to.be.true;
      });

      it('sets the design doc with updated view', function () {
        var viewInfo = {
          viewName: 'test-view',
          designDocId: '_design/test-doc',
          map: 'map',
          reduce: '_sum',
          newDesignDoc: false,
          newView: true,
        };

        Actions.saveView(viewInfo, designDocs);

        var updatedDesignDoc = designDocs.first().dDocModel();
        expect(updatedDesignDoc.get('views')['test-view'].reduce).to.equal('_sum');
      });

      it('saves doc', function () {
        var viewInfo = {
          viewName: 'test-view',
          designDocId: '_design/test-doc',
          map: 'map',
          reduce: '_sum',
          newDesignDoc: false,
          newView: true
        };

        var updatedDesignDoc = designDocs.first().dDocModel();
        var spy = sinon.spy(updatedDesignDoc, 'save');
        Actions.saveView(viewInfo, designDocs);

        expect(spy.calledOnce).to.be.true;
      });

      it('navigates to new url for new view', function () {
        var spy = sinon.spy(FauxtonAPI, 'navigate');

        var viewInfo = {
          database: database,
          viewName: 'test-view',
          designDocId: '_design/test-doc',
          map: 'map',
          reduce: '_sum',
          newDesignDoc: false,
          newView: true
        };
        var designDoc = designDocs.first();

        designDoc.save = function () {
          var promise = $.Deferred();
          promise.resolve(); 
          return promise;
        };

        Actions.saveView(viewInfo, designDocs);
        expect(spy.calledOnce).to.be.true;
        expect(spy.getCall(0).args[0]).to.match(/_view\/test-view/);
      });

      it('triggers update all docs', function () {
        var spy = sinon.spy(FauxtonAPI, 'triggerRouteEvent');

        var viewInfo = {
          viewName: 'test-view',
          designDocId: '_design/test-doc',
          map: 'map',
          reduce: '_sum',
          newDesignDoc: false,
          newView: false
        };
        var designDoc = designDocs.first();

        designDoc.save = function () {
          var promise = $.Deferred();
          promise.resolve(); 
          return promise;
        };

        Actions.saveView(viewInfo, designDocs);
        expect(spy.calledOnce).to.be.true;
        expect(spy.getCall(0).args[0]).to.equal('updateAllDocs');
      });
    });

    describe('delete view', function () {
      var designDocs, database, designDoc, designDocId, viewName;
      beforeEach(function () {
        database = {
          safeID: function () { return 'safeid';}
        };

        viewName = 'test-view';
        designDocId = '_design/test-doc';
        designDocs = new Documents.AllDocs([{
          _id: designDocId ,
          views: {
              'test-view': {
                map: 'function () {};',
              },
              'test-view2': {
                map: 'function () {};',
              }
            }
          }], {
          params: { limit: 10 },
          database: database
        });

        designDoc = designDocs.first();

      });

      afterEach(function () {
        FauxtonAPI.navigate.restore && FauxtonAPI.navigate.restore();
        FauxtonAPI.triggerRouteEvent.restore && FauxtonAPI.triggerRouteEvent.restore();
      });

      it('removes view from design doc', function () {

        Actions.deleteView({
          viewName: viewName,
          designDocId: designDocId,
          database: database,
          designDocs: designDocs
        });

        expect(designDoc.getDdocView(viewName)).to.equal(undefined);
      });

      it('saves design do if has other views', function () {
        var spy = sinon.spy(designDoc, 'save');

        Actions.deleteView({
          viewName: viewName,
          designDocId: designDocId,
          database: database,
          designDocs: designDocs
        });

        expect(spy.calledOnce).to.be.true;
      });

      it('deletes design doc if has no other views', function () {
        var spy = sinon.spy(designDoc, 'destroy');
        designDoc.removeDdocView('test-view2');

        Actions.deleteView({
          viewName: viewName,
          designDocId: designDocId,
          database: database,
          designDocs: designDocs
        });

        expect(spy.calledOnce).to.be.true;

      });

      it('navigates to all docs', function () {
        var spy = sinon.spy(FauxtonAPI, 'navigate');

        designDoc.save = function () {
          var promise = $.Deferred();
          promise.resolve(); 
          return promise;
        };

        Actions.deleteView({
          viewName: viewName,
          designDocId: designDocId,
          database: database,
          designDocs: designDocs
        });


        expect(spy.getCall(0).args[0]).to.match(/_all_docs/);
        expect(spy.calledOnce).to.be.true;
      });

      it('triggers design doc reload', function () {
        var spy = sinon.spy(FauxtonAPI, 'triggerRouteEvent');

        designDoc.save = function () {
          var promise = $.Deferred();
          promise.resolve(); 
          return promise;
        };

        Actions.deleteView({
          viewName: viewName,
          designDocId: designDocId,
          database: database,
          designDocs: designDocs
        });

        expect(spy.calledOnce).to.be.true;
        expect(spy.getCall(0).args[0]).to.equal('reloadDesignDocs');
      });

    });
  });
});
