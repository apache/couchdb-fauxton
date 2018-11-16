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
import TableHeader from '../components/tableheader';
import FilterTabs from '../components/filtertabs';
import React from "react";
import {mount} from 'enzyme';
import sinon from "sinon";

describe('Active Tasks -- Components', () => {

  describe('Active Tasks Table (Components)', () => {
    describe('Active Tasks Filter tray', () => {

      const radioTexts = [
        'Replication',
        'Database Compaction',
        'Indexer',
        'View Compaction'
      ];

      it('should trigger change to radio buttons', () => {
        radioTexts.forEach((text) => {
          let spy = sinon.spy();
          const tabs = mount(
            <FilterTabs
              onRadioClick={spy}
              selectedRadio={"All Tasks"}
              radioNames={radioTexts}
            />
          );

          tabs.find(`input[value="${text}"]`).simulate('change');
          expect(spy.calledOnce).toBeTruthy();
        });
      });

      it('should trigger change to search term', () => {
        const spy = sinon.spy();
        const tabs = mount(
          <FilterTabs
            onSearch={spy}
            selectedRadio={"All Tasks"}
          />
        );
        tabs.find('.searchbox').simulate('change', {target: {value: 'searching'}});
        expect(spy.calledOnce).toBeTruthy();
      });
    });

    describe('Active Tasks Table Headers', () => {
      const tableTexts = [
        'type',
        'database',
        'started-on'
      ];

      it('should trigger change to radio buttons', () => {

        tableTexts.forEach((text) => {
          let spy = sinon.spy();
          const table = mount(
            <table>
              <TableHeader
                onTableHeaderClick={spy}
                headerIsAscending={true}
                sortByHeader={"All Tasks"}
              />
            </table>
          );

          table.find(`.${text}`).simulate('click');
          expect(spy.calledOnce).toBeTruthy();
        });
      });
    });
  });
});
