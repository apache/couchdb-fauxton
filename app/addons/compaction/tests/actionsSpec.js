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
  'addons/compaction/stores',
  'addons/compaction/resources',
  'addons/compaction/actions',
  'testUtils'
], function (FauxtonAPI, Stores, Compaction, Actions, testUtils) {
  var assert = testUtils.assert;
  var restore = testUtils.restore;
  var store = Stores.compactionStore;

  describe('Compaction Actions', function () {

    describe('Compact Database', function () {
      var database = {};

      afterEach(function () {
        restore(FauxtonAPI.addNotification);
      });

      it('compacts database', function () {
        var spy = false;
        var promise = FauxtonAPI.Deferred();

        Compaction.compactDB = function () {
          spy = true;
          return promise;
        };

        Actions.compactDatabase(database);
        assert.ok(spy);
      });

      it('notifies on success', function () {
        var spy = sinon.spy(FauxtonAPI, 'addNotification');
        var promise = FauxtonAPI.Deferred();
        promise.resolve();

        Compaction.compactDB = function () {
          return promise;
        };

        Actions.compactDatabase(database);
        assert.ok(spy.calledOnce);
      });

      it('notifies on failure', function () {
        var spy = sinon.spy(FauxtonAPI, 'addNotification');
        var promise = FauxtonAPI.Deferred();
        promise.reject({
          responseText: JSON.stringify({reason: 'testing'})
        });

        Compaction.compactDB = function () {
          return promise;
        };

        Actions.compactDatabase(database);
        assert.ok(spy.calledOnce);
      });

      it('sets compacting view to true on start', function () {
        var promise = FauxtonAPI.Deferred();

        Compaction.compactDB = function () {
          return promise;
        };

        Actions.compactDatabase(database);
        assert.ok(store.isCompacting());
      });

      it('sets compacting view to false on completion of request', function () {
        var promise = FauxtonAPI.Deferred();
        promise.resolve();

        Compaction.compactDB = function () {
          return promise;
        };

        Actions.compactDatabase(database);
        assert.notOk(store.isCompacting());
      });

    });

    describe('Clean Views', function () {
      var database = {};

      afterEach(function () {
        restore(FauxtonAPI.addNotification);
      });

      it('cleans views', function () {
        var spy = false;
        var promise = FauxtonAPI.Deferred();

        Compaction.cleanupViews = function () {
          spy = true;
          return promise;
        };

        Actions.cleanupViews(database);
        assert.ok(spy);
      });

      it('notifies on success', function () {
        var spy = sinon.spy(FauxtonAPI, 'addNotification');
        var promise = FauxtonAPI.Deferred();
        promise.resolve();

        Compaction.cleanupViews = function () {
          return promise;
        };

        Actions.cleanupViews(database);
        assert.ok(spy.calledOnce);
      });

      it('notifies on failure', function () {
        var spy = sinon.spy(FauxtonAPI, 'addNotification');
        var promise = FauxtonAPI.Deferred();
        promise.reject({
          responseText: JSON.stringify({reason: 'testing'})
        });

        Compaction.cleanupViews = function () {
          return promise;
        };

        Actions.cleanupViews(database);
        assert.ok(spy.calledOnce);
      });

      it('sets compacting view to true on start', function () {
        var promise = FauxtonAPI.Deferred();

        Compaction.cleanupViews = function () {
          return promise;
        };

        Actions.cleanupViews(database);
        assert.ok(store.isCleaningViews());
      });

      it('sets compacting view to false on completion of request', function () {
        var promise = FauxtonAPI.Deferred();
        promise.resolve();

        Compaction.cleanupViews = function () {
          return promise;
        };

        Actions.cleanupViews(database);
        assert.notOk(store.isCleaningViews());
      });

    });

    describe('Compact View', function () {
      var database = {};
      var designDoc = '_design/test-doc';

      afterEach(function () {
        restore(FauxtonAPI.addNotification);
      });

      it('compacts database', function () {
        var spy = false;
        var promise = FauxtonAPI.Deferred();

        Compaction.compactView = function () {
          spy = true;
          return promise;
        };

        Actions.compactView(database, designDoc);
        assert.ok(spy);
      });

      it('notifies on success', function () {
        var spy = sinon.spy(FauxtonAPI, 'addNotification');
        var promise = FauxtonAPI.Deferred();
        promise.resolve();

        Compaction.compactView = function () {
          return promise;
        };

        Actions.compactView(database, designDoc);
        assert.ok(spy.calledOnce);
      });

      it('notifies on failure', function () {
        var spy = sinon.spy(FauxtonAPI, 'addNotification');
        var promise = FauxtonAPI.Deferred();
        promise.reject({
          responseText: JSON.stringify({reason: 'testing'})
        });

        Compaction.compactView = function () {
          return promise;
        };

        Actions.compactView(database, designDoc);
        assert.ok(spy.calledOnce);
      });

      it('sets compacting view to true on start', function () {
        var promise = FauxtonAPI.Deferred();

        Compaction.compactView = function () {
          return promise;
        };

        Actions.compactView(database, designDoc);
        assert.ok(store.isCompactingView());
      });

      it('sets compacting view to false on completion of request', function () {
        var promise = FauxtonAPI.Deferred();
        promise.resolve();

        Compaction.compactView = function () {
          return promise;
        };

        Actions.compactView(database, designDoc);
        assert.notOk(store.isCompactingView());
      });

    });

  });
});
