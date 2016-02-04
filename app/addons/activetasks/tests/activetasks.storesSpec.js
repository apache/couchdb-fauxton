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
  '../../../core/api',
  '../resources',
  '../stores',
  './fakeActiveTaskResponse',
  'react',
  '../../../../test/mocha/testUtils',
  'react-addons-test-utils',
  'sinon'
], function (FauxtonAPI, ActiveTasks, Stores, fakedResponse, React, utils, TestUtils, sinon) {
  var assert = utils.assert;
  var restore = utils.restore;

  var activeTasksStore = Stores.activeTasksStore;
  var activeTasksCollection = new ActiveTasks.AllTasks();
  activeTasksCollection.parse(fakedResponse);

  describe('Active Tasks -- Stores', function () {
    var spy, clock;

    beforeEach(function () {
      activeTasksStore.initAfterFetching(activeTasksCollection.table, activeTasksCollection);
      clock = sinon.useFakeTimers();
    });

    afterEach(function () {
      restore(spy);
      clock.restore();
    });

    describe('Active Task Stores - Polling', function () {
      var pollingWidgetDiv, pollingWidget;

      beforeEach(function () {
        activeTasksStore.initAfterFetching(activeTasksCollection.table, activeTasksCollection);
      });

      afterEach(function () {
        restore(activeTasksStore.getPollingInterval);
        restore(window.clearInterval);
      });

      it('should poll at the min time', function () {
        spy = sinon.spy(activeTasksStore, 'getPollingInterval');
        var minTime = 1;
        activeTasksStore.setPollingInterval(minTime);
        activeTasksStore.setPolling();
        assert.ok(spy.calledOnce);

        setInterval(spy, minTime * 1000);
        clock.tick(minTime * 1000);
        assert.ok(spy.calledTwice);

        clock.tick(minTime * 1000);
        assert.ok(spy.calledThrice);
      });

      it('should poll at the max time', function () {
        spy = sinon.spy(activeTasksStore, 'getPollingInterval');

        var maxTime = 30;
        activeTasksStore.setPollingInterval(maxTime);
        activeTasksStore.setPolling();
        assert.ok(spy.calledOnce);

        setInterval(spy, maxTime * 1000);
        clock.tick(maxTime * 1000);
        assert.ok(spy.calledTwice);

        clock.tick(maxTime * 1000);
        assert.ok(spy.calledThrice);
      });

      it('should poll at a mid time', function () {
        spy = sinon.spy(activeTasksStore, 'getPollingInterval');

        var midtime = 15;
        activeTasksStore.setPollingInterval(midtime);
        activeTasksStore.setPolling();
        assert.ok(spy.calledOnce);

        setInterval(spy, midtime * 1000);
        clock.tick(midtime * 1000);
        assert.ok(spy.calledTwice);

        clock.tick(midtime * 1000);
        assert.ok(spy.calledThrice);
      });

      it('should clear interval each time', function () {
        var spy = sinon.spy(window, 'clearInterval');
        activeTasksStore.setPolling();
        assert.ok(spy.calledOnce);
      });

      it('should set the isLoading variable so that the loading lines show up', function () {
        spy = sinon.spy(activeTasksStore, 'setIsLoading');
        var date = new Date();

        activeTasksCollection.pollingFetch();
        assert.ok(spy.withArgs(true, date).calledOnce);

        activeTasksCollection.parse(fakedResponse);
        assert.ok(spy.withArgs(false, date).calledOnce);

        restore(activeTasksStore.setIsLoading);
      });
    });

    describe('Active Task Stores - Filter Tab Tray', function () {
      var fakeFilteredTable, storeFilteredtable;
      function sort (a, b, sortBy) {  //sorts array by objects with key 'sortBy', with default started_on
        if (_.isUndefined(sortBy)) {
          sortBy = 'started-on';
        }
        return b[sortBy] - a[sortBy];
      }

      afterEach(function () {
        fakeFilteredTable = [];
      });

      it('should filter the table correctly, by radio -- All Tasks', function () {
        activeTasksStore.setSelectedRadio('all_tasks');
        //parse table and check that it only contains objects any type
        var table = activeTasksStore.getFilteredTable(activeTasksStore._collection);
        assert.ok(activeTasksStore._collection.length, table.length);
      });

      it('should filter the table correctly, by radio', function () {
        activeTasksStore.setSelectedRadio('replication');
        var storeFilteredtable = activeTasksStore.getFilteredTable(activeTasksStore._collection);

        //parse table and check that it only contains objects with type: Replication
        _.each(storeFilteredtable, function (activeTask) {
          assert.ok(activeTasksStore.passesRadioFilter(activeTask));
          assert.deepEqual(activeTask.type, activeTasksStore.getSelectedRadio());
        });
      });

      it('should search the table correctly', function () {
        activeTasksStore.setSelectedRadio('all_tasks');
        var searchTerm = 'base';
        activeTasksStore.setSearchTerm(searchTerm);
        var storeGeneratedTable = activeTasksStore.getFilteredTable(activeTasksStore._collection);
        var regEx = new RegExp(searchTerm);

        fakeFilteredTable = [
          { user: 'information'},
          { user: 'ooo'}
        ];

        assert.equal(fakeFilteredTable[0].user, storeGeneratedTable[0].user);
        assert.equal(fakeFilteredTable[1].user, storeGeneratedTable[1].user);
      });
    });

    describe('Active Task Stores - Table Header Sort - Select Ascending/Descending', function () {

      it('should set header as ascending, on default', function () {
        activeTasksStore.setSelectedRadio('all-tasks');
        activeTasksStore._headerIsAscending = true;
        assert.ok(activeTasksStore.getHeaderIsAscending());
      });

      it('should set header as descending, if same header is selected again', function () {
        activeTasksStore._prevSortbyHeader = 'sameHeader';
        activeTasksStore._sortByHeader = 'sameHeader';
        activeTasksStore.toggleHeaderIsAscending();
        assert.notOk(activeTasksStore.getHeaderIsAscending());
      });

      it('should set header as ascending, if different header is selected', function () {
        activeTasksStore._sortByHeader = 'differentHeader';
        activeTasksStore.toggleHeaderIsAscending();
        assert.ok(activeTasksStore.getHeaderIsAscending());
      });
    });
  });
});
