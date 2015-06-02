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
  'addons/dashboard/resources',
  'addons/dashboard/components.react',
  'addons/dashboard/stores',
  'react',
  'addons/dashboard/actions',
  'addons/activetasks/tests/fakeActiveTaskResponse',
  'testUtils'
], function (FauxtonAPI, Dashboard, Components, Stores, React, Actions, fakedResponse, testUtils) {
  var assert = testUtils.assert;
  var TestUtils = React.addons.TestUtils;
  var dashboardStore = Stores.dashboardStore;
  var allActiveTasksCollection = new Dashboard.AllTasks({});
  allActiveTasksCollection.parse(fakedResponse);

  describe('Dashboard  -- Components', function () {

    describe('Active Task Widget (Components)', function () {
      var activeTasksTableDiv, activeTasksWidget;

      beforeEach(function () {
        activeTasksTableDiv = document.createElement('div');
        dashboardStore.dashboardWidgetActiveTaskInitialize(allActiveTasksCollection.table, allActiveTasksCollection);
        activeTasksWidget = TestUtils.renderIntoDocument(React.createElement(Components.DashboardController, null), activeTasksTableDiv);
      });

      it('active tasks widget header should be "Active Tasks"', function () {
        var widgetHeader = $(activeTasksWidget.getDOMNode()).find('.widget-header').text();
        assert.equal(widgetHeader.trim(), 'Active Tasks');
      });

      it('active tasks table should display, although there are no active tasks', function () {
        Actions.setCollection(undefined);
        assert.equal($(activeTasksWidget.getDOMNode()).find('.active-task-table').length, 1);
      });

      it('if there are no active tasks, it display a message instead of empty table rows', function () {
        Actions.setCollection(undefined);
        var tableText = $(activeTasksWidget.getDOMNode()).find('.noResult').text();
        assert.equal(tableText.trim(), 'No active tasks.');
      });

      it('render the data into the active task table if there are not empty collection', function () {
        var collection = dashboardStore.getCollection();
        var isEmpty = _.isEmpty(collection);
        var activeTasksWidget = TestUtils.renderIntoDocument(<Components.ActiveTaskWidget collection={collection} isEmpty={isEmpty}/>, activeTasksWidget);
        assert.ok(!_.isEmpty(activeTasksWidget.getCollection()));
      });
    });
  });
});
