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
import ActiveTasks from "../resources";
import Stores from "../stores";
import fakedResponse from "./fakeActiveTaskResponse";
import utils from "../../../../test/mocha/testUtils";
const assert = utils.assert;

var activeTasksStore = Stores.activeTasksStore;
var activeTasksCollection = new ActiveTasks.AllTasks();
activeTasksCollection.parse(fakedResponse);

describe('Active Tasks -- Stores', function () {
  beforeEach(function () {
    activeTasksStore.initAfterFetching(activeTasksCollection.table, activeTasksCollection);
  });

  describe('Active Task Stores - Filter Tab Tray', function () {
    var fakeFilteredTable;

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
      _.each(storeFilteredtable, (activeTask) => {
        assert.ok(activeTasksStore.passesRadioFilter(activeTask));
        assert.deepEqual(activeTask.type, activeTasksStore.getSelectedRadio());
      });
    });

    it('should search the table correctly', function () {
      activeTasksStore.setSelectedRadio('all_tasks');
      var searchTerm = 'base';
      activeTasksStore.setSearchTerm(searchTerm);
      var storeGeneratedTable = activeTasksStore.getFilteredTable(activeTasksStore._collection);

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
      activeTasksStore._prevSortbyHeader = 'sameHeader';
      activeTasksStore.toggleHeaderIsAscending();
      assert.ok(activeTasksStore.getHeaderIsAscending());
    });
  });
});
