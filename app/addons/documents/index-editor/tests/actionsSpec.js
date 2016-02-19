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
      safeID: function () { return 'id'; }
    };


    describe('delete view', function () {
      var designDocs, database, designDoc, designDocId, viewName;
      beforeEach(function () {
        database = {
          safeID: function () { return 'safeid';}
        };

        viewName = 'test-view';
        designDocId = '_design/test-doc';
        designDocs = new Documents.AllDocs([{
          _id: designDocId,
          _rev: '1-231',
          views: {
              'test-view': {
                map: 'function () {};'
              },
              'test-view2': {
                map: 'function () {};'
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
