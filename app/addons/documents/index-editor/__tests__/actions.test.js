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

import FauxtonAPI from "../../../../core/api";
import Actions from "../actions";
import Documents from "../../resources";
import testUtils from "../../../../../test/mocha/testUtils";
import sinon from "sinon";
import "../../../documents/base";
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
      designDoc = _.head(designDocs);
    });

    afterEach(function () {
      restore(FauxtonAPI.navigate);
    });

    it('saves design doc if has other views', function () {
      designDoc.save = function () {
        return FauxtonAPI.Promise.resolve();
      };
      var saveSpy = sinon.spy(designDoc, 'save');
      designDocs.fetch = function () {
        return FauxtonAPI.Promise.resolve();
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
        return FauxtonAPI.Promise.resolve();
      };
      var destroySpy = sinon.spy(designDoc, 'destroy');
      designDocs.remove = function () {};
      designDocs.fetch = function () {
        return FauxtonAPI.Promise.resolve();
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
        return FauxtonAPI.Promise.resolve();
      };
      designDocs.fetch = function () {
        return FauxtonAPI.Promise.resolve();
      };
      return Actions.deleteView({
        indexName: viewName,
        database: database,
        designDocs: designDocs,
        designDoc: designDoc,
        isOnIndex: true
      }).then(() => {
        assert.ok(spy.getCall(0).args[0].match(/_all_docs/));
        assert.ok(spy.calledOnce);
      });
    });

    it('saves design doc if it has no view section', function () {
      const ddoc = { _id: designDocId };
      const ddocModel = new Documents.Doc(ddoc, { database: database });

      ddocModel.setDdocView('testview', '() => {}', '() => {}');
      assert.deepEqual(ddocModel.get('views'), {
        testview: {
          map: '() => {}',
          reduce: '() => {}'
        }
      });
      assert.equal(ddocModel.get('language'), 'javascript');
    });

    it('removes old view only when editting', function () {
      const viewInfo = {
        newView: false,
        originalDesignDocName: 'test',
        designDocId: 'test',
        originalViewName: 'foo',
        viewName: 'bar'
      };
      assert.isTrue(Actions.shouldRemoveDdocView(viewInfo));

      viewInfo.newView = true;
      assert.isFalse(Actions.shouldRemoveDdocView(viewInfo));
    });
  });
});
