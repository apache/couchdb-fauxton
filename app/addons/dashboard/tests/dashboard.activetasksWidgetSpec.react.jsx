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
      var activeTasksDiv, activeTasksWidget;

      beforeEach(function () {
        activeTasksDiv = document.createElement('div');
        dashboardStore.dashboardWidgetActiveTaskInitialize(allActiveTasksCollection.table, allActiveTasksCollection);
        activeTasksWidget = TestUtils.renderIntoDocument(<Components.DashboardController/>, activeTasksDiv);
      });

      it('active tasks widget header should be "Active Replications"', function () {
        var widgetHeader = $(activeTasksWidget.getDOMNode()).find('.widget-header').text();
        assert.equal(widgetHeader.trim(), 'Active Replications');
      });

      it('show active tasks boxes when there is not empty collection', function () {
        assert.equal($(activeTasksWidget.getDOMNode()).find('.active-tasks-box').length, 3);
      });

      it('when there are no active replications, it should display a box with a message', function () {
        Actions.setCollection(undefined);
        assert.equal($(activeTasksWidget.getDOMNode()).find('.active-tasks-box').length, 3);
      });

    });
  });
});
