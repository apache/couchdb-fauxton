
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

import React from "react";
import ReactDOM from "react-dom";
import ChangeRow from '../changes/components/ChangeRow';
import ChangesScreen from '../changes/components/ChangesScreen';
import ChangesTabContent from "../changes/components/ChangesTabContent";
import {mount} from 'enzyme';
import utils from "../../../../test/mocha/testUtils";
import sinon from "sinon";
import '../base';

const assert = utils.assert;


describe('ChangesTabContent', () => {
  const defaultProps = {
    filters: [],
    addFilter: () => {},
    removeFilter: () => {}
  };

  it('should add filter badges', () => {
    const el = mount(<ChangesTabContent
      {...defaultProps}
      filters={['I wandered lonely as a filter', 'A second filter']}
    />);

    assert.equal(2, el.find('.remove-filter').length);
  });

  it('should call addFilter action on click', () => {
    const addFilterStub = sinon.stub();
    const el = mount(<ChangesTabContent
      {...defaultProps}
      addFilter={addFilterStub}
    />);
    const submitBtn = el.find('[type="submit"]'),
          addItemField = el.find('.js-changes-filter-field');

    addItemField.simulate('change', {target: {value: 'I wandered lonely as a filter'}});
    submitBtn.simulate('submit');

    assert.ok(addFilterStub.calledOnce);
  });

  it('should call removeFilter action on click', () => {
    const removeFilterStub = sinon.stub();
    const el = mount(<ChangesTabContent
      {...defaultProps}
      filters={['I wandered lonely as a filter']}
      removeFilter={removeFilterStub}
    />);
    el.find('.remove-filter').simulate('click');

    assert.ok(removeFilterStub.calledOnce);
  });

  it('should not add empty filters', () => {
    const addFilterStub = sinon.stub();
    const el = mount(<ChangesTabContent
      {...defaultProps}
      addFilter={addFilterStub}
    />);
    const submitBtn = el.find('[type="submit"]'),
          addItemField = el.find('.js-changes-filter-field');

    addItemField.simulate('change', {target: {value: ''}});
    submitBtn.simulate('submit');

    assert.ok(addFilterStub.notCalled);
  });

  it('should not add badges by default', () => {
    const el = mount(<ChangesTabContent
      {...defaultProps}
    />);
    assert.equal(0, el.find('.remove-filter').length);
  });

  it('should not add the same filter twice', () => {
    const filters = [];
    let callCount = 0;
    const el = mount(<ChangesTabContent
      {...defaultProps}
      addFilter={(f) => {filters.push(f); callCount++;}}
      filters={filters}
    />);
    const submitBtn = el.find('[type="submit"]'),
          addItemField = el.find('.js-changes-filter-field');

    const filter = 'I am unique in the whole wide world';
    addItemField.simulate('change', {target: {value: filter}});
    submitBtn.simulate('submit');

    addItemField.simulate('change', {target: {value: filter}});
    submitBtn.simulate('submit');

    assert.equal(callCount, 1);
  });
});


describe('ChangesScreen', () => {
  const changesList = [
    { id: 'doc_1', seq: 4, deleted: false, changes: { code: 'here' }, isNew: false },
    { id: 'doc_2', seq: 1, deleted: false, changes: { code: 'here' }, isNew: false },
    { id: 'doc_3', seq: 6, deleted: true, changes: { code: 'here' }, isNew: false },
    { id: 'doc_4', seq: 7, deleted: false, changes: { code: 'here' }, isNew: false },
    { id: 'doc_5', seq: 1, deleted: true, changes: { code: 'here' }, isNew: false }
  ];

  const defaultProps = {
    changes: [],
    loaded: true,
    databaseName: 'my_db',
    isShowingSubset: false,
    loadChanges: () => {}
  };

  it('should list the right number of changes', () => {
    const changesEl = mount(<ChangesScreen
      {...defaultProps}
      changes={changesList}
    />);

    assert.equal(changesList.length, changesEl.find('.change-box').length);
  });

  it('shows a No Docs Found message if no docs', () => {
    const changesEl = mount(<ChangesScreen
      {...defaultProps}
    />);
    assert.ok(/There\sare\sno\sdocument\schanges/.test(changesEl.html()));
  });

  it('should show a message if the results are truncated', () => {
    const changesEl = mount(<ChangesScreen
      {...defaultProps}
      changes={changesList}
      isShowingSubset={true}
    />);
    assert.equal(1, changesEl.find('.changes-result-limit').length);
  });
});


describe('ChangeRow', () => {
  const change = {
    id: '123',
    seq: 5,
    deleted: false,
    changes: { code: 'here' }
  };

  it('clicking the toggle-json button shows the code section', function () {
    const changeRow = mount(<ChangeRow change={change} databaseName="testDatabase" />);

    // confirm it's hidden by default
    assert.equal(0, changeRow.find('.prettyprint').length);

    // confirm clicking it shows the element
    changeRow.find('button.btn').simulate('click');
    assert.equal(1, changeRow.find('.prettyprint').length);
  });

  it('deleted docs should not be clickable', () => {
    change.deleted = true;
    const changeRow = mount(<ChangeRow change={change} databaseName="testDatabase" />);
    assert.equal(0, changeRow.find('a.js-doc-link').length);
  });

  it('non-deleted docs should be clickable', () => {
    change.deleted = false;
    const changeRow = mount(<ChangeRow change={change} databaseName="testDatabase" />);
    assert.equal(1, changeRow.find('a.js-doc-link').length);
  });
});
