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
  'addons/activetasks/resources',
  'addons/activetasks/components.react',
  'addons/activetasks/stores',
  'addons/activetasks/tests/fakeActiveTaskResponse',
  'react',
  'addons/activetasks/actions',
  'testUtils'
], function (FauxtonAPI, ActiveTasks, Components, Stores, fakedResponse, React, Actions, utils) {
  var assert = utils.assert;
  var restore = utils.restore;
  var TestUtils = React.addons.TestUtils;
  var activeTasksStore = Stores.activeTasksStore;
  var activeTasksCollection = new ActiveTasks.AllTasks({});
  activeTasksCollection.parse(fakedResponse);

  describe('Active Tasks -- Components', function () {

    describe('Active Tasks Polling (Components)', function () {
      var pollingWidgetDiv, pollingWidget;

      beforeEach(function () {
        pollingWidgetDiv = document.createElement('div');
        pollingWidget = TestUtils.renderIntoDocument(
          <Components.ActiveTasksPollingWidgetController />, pollingWidgetDiv
        );
      });

      afterEach(function () {
        React.unmountComponentAtNode(pollingWidgetDiv);
        restore(Actions.changePollingInterval);
      });

      it('should trigger update polling interval', function () {
        var spy = sinon.spy(Actions, 'changePollingInterval');
        var rangeNode = TestUtils.findRenderedDOMComponentWithTag(pollingWidget, 'input');
        var time = '9';

        TestUtils.Simulate.change(rangeNode, {target: {value: time}});
        assert.ok(spy.calledOnce);
      });
    });

    describe('Active Tasks Table (Components)', function () {
      var table, tableDiv, spy, filterTab;

      beforeEach(function () {
        tableDiv = document.createElement('div');
        activeTasksStore.initAfterFetching(activeTasksCollection.table, activeTasksCollection);
        table = TestUtils.renderIntoDocument(<Components.ActiveTasksController />, tableDiv);

        // open filter tray
        //filterTab = TestUtils.findRenderedDOMComponentWithClass(table, 'toggle-filter-tab');
        //TestUtils.Simulate.click(filterTab);
      });

      afterEach(function () {
        React.unmountComponentAtNode(tableDiv);
        restore(window.confirm);
      });

      it('it displays a message instead of an empty table, if there are undefined active tasks', function () {
        Actions.setCollection(undefined);
        var tableText = $(table.getDOMNode())[0].innerText;
        assert.equal(tableText.trim(), 'No active tasks.');
      });

      describe('Active Tasks Filter tray', function () {

        afterEach(function () {
          restore(Actions.switchTab);
          restore(Actions.setSearchTerm);
        });

        var radioIDs = [
          'Replication',
          'Database-Compaction',
          'Indexer',
          'View-Compaction'
        ];

        it('should trigger change to radio buttons', function () {
          _.each(radioIDs, function (radioID) {
            spy = sinon.spy(Actions, 'switchTab');
            TestUtils.Simulate.change($(table.getDOMNode()).find('#' + radioID)[0]);
            assert.ok(spy.calledOnce);
            spy.restore();
          });
        });

        it('should trigger change to search term', function () {
          spy = sinon.spy(Actions, 'setSearchTerm');
          TestUtils.Simulate.change($(table.getDOMNode()).find('.searchbox')[0], {target: {value: 'searching'}});
          assert.ok(spy.calledOnce);
        });
      });

      describe('Active Tasks Table Headers', function () {
        var headerNames = [
          'type',
          'database',
          'started_on',
          'updated_on',
          'pid',
          'progress'
        ];

        afterEach(function () {
          restore(Actions.sortByColumnHeader);
        });

        it('should trigger change to which header to sort by', function () {
          _.each(headerNames, function (header) {
            spy = sinon.spy(Actions, 'sortByColumnHeader');
            TestUtils.Simulate.change($(table.getDOMNode()).find('#' + header)[0]);
            assert.ok(spy.calledOnce);
            spy.restore();
          });
        });
      });
    });
  });
});
