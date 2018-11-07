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

import FauxtonAPI from '../../../../core/api';
import Actions from '../actions';
import Documents from '../../resources';
import testUtils from '../../../../../test/mocha/testUtils';
import sinon from 'sinon';
import '../../../documents/base';

const restore = testUtils.restore;
FauxtonAPI.router = new FauxtonAPI.Router([]);

describe('Index Editor Actions', function () {

  describe('delete view', function () {
    let designDocs, database, designDoc, designDocCollection, designDocId, viewName;
    beforeEach(function () {
      FauxtonAPI.reduxDispatch = sinon.stub();
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
      const saveSpy = sinon.spy(designDoc, 'save');
      designDocs.fetch = function () {
        return FauxtonAPI.Promise.resolve();
      };

      Actions.deleteView({
        indexName: viewName,
        database: database,
        designDocs: designDocs,
        designDoc: designDoc
      });

      sinon.assert.calledOnce(saveSpy);
    });

    it('deletes design doc if has no other views', function () {
      designDoc.removeDdocView('test-view2');

      designDoc.destroy = function () {
        return FauxtonAPI.Promise.resolve();
      };
      const destroySpy = sinon.spy(designDoc, 'destroy');
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

      sinon.assert.calledOnce(destroySpy);
    });

    it('navigates to all docs if was on view', function () {
      const spy = sinon.spy(FauxtonAPI, 'navigate');

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
        sinon.assert.calledWithMatch(spy, /_all_docs/);
        sinon.assert.calledOnce(spy);
      });
    });

    it('saves design doc if it has no view section', function () {
      const ddoc = { _id: designDocId };
      const ddocModel = new Documents.Doc(ddoc, { database: database });

      ddocModel.setDdocView('testview', '() => {}', '() => {}');
      expect(ddocModel.get('views')).toEqual({
        testview: {
          map: '() => {}',
          reduce: '() => {}'
        }
      });
      expect(ddocModel.get('language')).toBe('javascript');
    });

    it('removes old view only when editting', function () {
      const viewInfo = {
        isNewView: false,
        originalDesignDocName: 'test',
        designDocId: 'test',
        originalViewName: 'foo',
        viewName: 'bar'
      };
      expect(Actions.shouldRemoveDdocView(viewInfo)).toBe(true);

      viewInfo.isNewView = true;
      expect(Actions.shouldRemoveDdocView(viewInfo)).toBe(false);
    });
  });
});
