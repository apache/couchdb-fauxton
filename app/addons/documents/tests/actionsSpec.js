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
  'addons/documents/index-editor/actions',
  'addons/documents/resources',
  'addons/documents/index-editor/actiontypes',
  'addons/documents/index-editor/stores',
  'testUtils',
  'addons/documents/index-results/actions',
  'addons/documents/base'
], function (FauxtonAPI, Actions, Documents, ActionTypes, Stores, testUtils, IndexResultsActions) {
  var assert = testUtils.assert;
  var restore = testUtils.restore;

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
          _rev: '1-231313',
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

        designDocs = designDocs.models;
      });

      afterEach(function () {
        restore(FauxtonAPI.navigate);
        restore(FauxtonAPI.triggerRouteEvent);
        restore(IndexResultsActions.reloadResultsList);
        restore(Actions.updateDesignDoc);
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
          newView: true,
          designDocs: designDocs
        };

        Actions.saveView(viewInfo);
        assert.ok(spy.calledOnce);
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
          newView: true,
          designDocs: designDocs
        };

        Actions.saveView(viewInfo);
        assert.ok(spy.calledOnce);
      });

      it('sets the design doc with updated view', function () {
        var viewInfo = {
          viewName: 'test-view',
          designDocId: '_design/test-doc',
          map: 'map',
          reduce: '_sum',
          newDesignDoc: false,
          newView: true,
          designDocs: designDocs
        };

        Actions.saveView(viewInfo);

        var updatedDesignDoc = _.first(designDocs).dDocModel();
        assert.equal(updatedDesignDoc.get('views')['test-view'].reduce, '_sum');
      });

      it('saves doc', function () {
        var viewInfo = {
          viewName: 'test-view',
          designDocId: '_design/test-doc',
          map: 'map',
          reduce: '_sum',
          newDesignDoc: false,
          newView: true,
          designDocs: designDocs
        };

        var updatedDesignDoc = _.first(designDocs).dDocModel();
        var spy = sinon.spy(updatedDesignDoc, 'save');
        Actions.saveView(viewInfo);

        assert.ok(spy.calledOnce);
      });

      it('updates design doc', function () {
        var viewInfo = {
          viewName: 'test-view',
          designDocId: '_design/test-doc',
          map: 'map',
          reduce: '_sum',
          newDesignDoc: false,
          newView: false,
          designDocs: designDocs,
          database: {
            safeID: function () { return '1';}
          }
        };

        designDocs.add = function () {};

        var promise = FauxtonAPI.Deferred();
        promise.resolve();

        var updatedDesignDoc = _.first(designDocs).dDocModel();
        var stub = sinon.stub(updatedDesignDoc, 'save');
        stub.returns(promise);

        var spy = sinon.spy(Actions, 'updateDesignDoc');
        Actions.saveView(viewInfo);

        assert.ok(spy.calledOnce);
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
          newView: true,
          designDocs: designDocs
        };
        var designDoc = _.first(designDocs);

        designDoc.save = function () {
          var promise = $.Deferred();
          promise.resolve();
          return promise;
        };

        Actions.saveView(viewInfo);
        assert.ok(spy.calledOnce);
        assert.ok(spy.getCall(0).args[0].match(/_view\/test-view/));
      });

      it('triggers reload results list', function () {
        var spy = sinon.spy(IndexResultsActions, 'reloadResultsList');

        var viewInfo = {
          viewName: 'test-view',
          designDocId: '_design/test-doc',
          map: 'map',
          reduce: '_sum',
          newDesignDoc: false,
          newView: false,
          designDocs: designDocs,
          database: {
            safeID: function () {
              return 'foo';
            }
          }
        };
        var designDoc = _.first(designDocs);

        designDoc.save = function () {
          var promise = $.Deferred();
          promise.resolve();
          return promise;
        };

        var stub = sinon.stub(Actions, 'updateDesignDoc');
        stub.returns(true);

        Actions.saveView(viewInfo);
        assert.ok(spy.calledOnce);
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
          _rev: '1-231',
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
        designDocs = designDocs.models;
        designDoc = _.first(designDocs);

      });

      afterEach(function () {
        restore(FauxtonAPI.navigate);
        restore(FauxtonAPI.triggerRouteEvent);
      });

      it('removes view from design doc', function () {

        Actions.deleteView({
          viewName: viewName,
          designDocId: designDocId,
          database: database,
          designDocs: designDocs
        });

        assert.ok(_.isUndefined(designDoc.getDdocView(viewName)));
      });

      it('saves design doc if has other views', function () {
        var spy = sinon.spy(designDoc, 'save');

        Actions.deleteView({
          viewName: viewName,
          designDocId: designDocId,
          database: database,
          designDocs: designDocs
        });

        assert.ok(spy.calledOnce);
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

        assert.ok(spy.calledOnce);

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


        assert.ok(spy.getCall(0).args[0].match(/_all_docs/));
        assert.ok(spy.calledOnce);
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

        assert.ok(spy.calledOnce);
        assert.equal(spy.getCall(0).args[0], 'reloadDesignDocs');
      });

    });
  });
});
