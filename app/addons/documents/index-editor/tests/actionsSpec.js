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
  '../../resources',
  '../actiontypes',
  '../stores',
  '../../../../../test/mocha/testUtils',
  '../../index-results/actions',
  'sinon',
  '../../../documents/base'
], function (FauxtonAPI, Actions, Documents, ActionTypes, Stores, testUtils, IndexResultsActions, sinon) {
  var assert = testUtils.assert;
  var restore = testUtils.restore;

  FauxtonAPI.router = new FauxtonAPI.Router([]);


  describe('Index Editor Actions', function () {

    describe('delete view', function () {
      var designDocs, database, designDoc, designDocCollection, designDocId, viewName;
      beforeEach(function () {
        database = {
          safeID: function () { return 'safeid';}
        };

        viewName = 'test-view';
        designDocId = '_design/test-doc';
        designDocCollection = new Documents.AllDocs([{
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
        designDocs = designDocCollection.models;
        designDoc = _.first(designDocs);
      });

      afterEach(function () {
        restore(FauxtonAPI.navigate);
        restore(FauxtonAPI.triggerRouteEvent);
      });

      it('saves design doc if has other views', function () {
        designDoc.save = function () {
          var promise = $.Deferred();
          promise.resolve();
          return promise;
        };
        var saveSpy = sinon.spy(designDoc, 'save');
        designDocs.fetch = function () {
          var promise = $.Deferred();
          promise.resolve();
          return promise;
        };

        Actions.deleteView({
          indexName: viewName,
          database: database,
          designDocs: designDocs,
          designDoc: designDoc
        });

        assert.ok(saveSpy.calledOnce);
      });

      it('deletes design doc if has no other views', function () {
        designDoc.removeDdocView('test-view2');

        designDoc.destroy = function () {
          var promise = $.Deferred();
          promise.resolve();
          return promise;
        };
        var destroySpy = sinon.spy(designDoc, 'destroy');
        designDocs.remove = function () {};
        designDocs.fetch = function () {
          var promise = $.Deferred();
          promise.resolve();
          return promise;
        };

        Actions.deleteView({
          indexName: viewName,
          database: database,
          designDocs: designDocs,
          designDoc: designDoc
        });

        assert.ok(destroySpy.calledOnce);
      });

      it('navigates to all docs if was on view', function () {
        var spy = sinon.spy(FauxtonAPI, 'navigate');

        designDoc.save = function () {
          var promise = $.Deferred();
          promise.resolve();
          return promise;
        };
        designDocs.fetch = function () {
          var promise = $.Deferred();
          promise.resolve();
          return promise;
        };
        Actions.deleteView({
          indexName: viewName,
          database: database,
          designDocs: designDocs,
          designDoc: designDoc,
          isOnIndex: true
        });

        assert.ok(spy.getCall(0).args[0].match(/_all_docs/));
        assert.ok(spy.calledOnce);
      });

    });
  });

});
