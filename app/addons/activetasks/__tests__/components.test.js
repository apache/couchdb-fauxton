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
import Components from "../components";
import Stores from "../stores";
import fakedResponse from "./fakeActiveTaskResponse";
import React from "react";
import ReactDOM from "react-dom";
import Actions from "../actions";
import utils from "../../../../test/mocha/testUtils";
import {mount} from 'enzyme';
import sinon from "sinon";
const assert = utils.assert;
var restore = utils.restore;
var activeTasksStore = Stores.activeTasksStore;
var activeTasksCollection = new ActiveTasks.AllTasks({});
activeTasksCollection.parse(fakedResponse);

describe('Active Tasks -- Components', () => {

  describe('Active Tasks Table (Components)', () => {
    let table;

    beforeEach(() => {
      activeTasksStore.initAfterFetching(activeTasksCollection.table, activeTasksCollection);
      table = mount(<Components.ActiveTasksController />);
    });

    afterEach(() => {
      restore(window.confirm);
    });

    describe('Active Tasks Filter tray', () => {

      afterEach(() => {
        restore(Actions.switchTab);
        restore(Actions.setSearchTerm);
      });

      const radioTexts = [
        'Replication',
        'Database Compaction',
        'Indexer',
        'View Compaction'
      ];

      it('should trigger change to radio buttons', () => {

        radioTexts.forEach((text) => {
          let spy = sinon.spy(Actions, 'switchTab');

          table.find(`input[value="${text}"]`).simulate('change');
          assert.ok(spy.calledOnce);

          spy.restore();
        });
      });

      it('should trigger change to search term', () => {
        const spy = sinon.spy(Actions, 'setSearchTerm');
        table.find('.searchbox').simulate('change', {target: {value: 'searching'}});
        assert.ok(spy.calledOnce);
      });
    });

    describe('Active Tasks Table Headers', () => {
      var headerNames = [
        'type',
        'database',
        'started-on',
        'updated-on',
        'pid',
        'progress'
      ];

      afterEach(() => {
        restore(Actions.sortByColumnHeader);
      });

      it('should trigger change to which header to sort by', () => {
        headerNames.forEach(header => {
          let spy = sinon.spy(Actions, 'sortByColumnHeader');
          table.find('#' + header).simulate('change');
          assert.ok(spy.calledOnce);
          spy.restore();
        });
      });
    });
  });
});
