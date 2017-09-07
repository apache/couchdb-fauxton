
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
import Changes from "../changes/components";
import Stores from "../changes/stores";
import Actions from "../changes/actions";
import {mount} from 'enzyme';
import utils from "../../../../test/mocha/testUtils";
import sinon from "sinon";
import '../base';

const assert = utils.assert;


describe('ChangesTabContent', () => {
  let el;

  beforeEach(() => {
    el = mount(<Changes.ChangesTabContent />);
  });

  afterEach(() => {
    Stores.changesStore.reset();
  });

  it('should add filter markup', () => {
    const submitBtn = el.find('[type="submit"]'),
        addItemField = el.find('.js-changes-filter-field');

    addItemField.simulate('change', {target: {value: 'I wandered lonely as a filter'}});
    submitBtn.simulate('submit');

    addItemField.simulate('change', {target: {value: 'A second filter'}});
    submitBtn.simulate('submit');

    assert.equal(2, el.find('.remove-filter').length);
  });

  it('should call addFilter action on click', () => {
    const submitBtn = el.find('[type="submit"]'),
      addItemField = el.find('.js-changes-filter-field');

    const spy = sinon.spy(Actions, 'addFilter');

    addItemField.simulate('change', {target: {value: 'I wandered lonely as a filter'}});
    submitBtn.simulate('submit');

    assert.ok(spy.calledOnce);
  });

  it('should remove filter markup', () => {
    const submitBtn = el.find('[type="submit"]'),
      addItemField = el.find('.js-changes-filter-field');

    addItemField.simulate('change', {target: {value: 'I wandered lonely as a filter'}});
    submitBtn.simulate('submit');

    addItemField.simulate('change', {target: {value: 'Flibble'}});
    submitBtn.simulate('submit');

    // clicks ALL 'remove' elements
    el.find('.remove-filter').first().simulate('click');
    el.find('.remove-filter').simulate('click');

    assert.equal(0, el.find('.remove-filter').length);
  });

  it('should call removeFilter action on click', () => {
    const submitBtn = el.find('[type="submit"]'),
      addItemField = el.find('.js-changes-filter-field');

    const spy = sinon.spy(Actions, 'removeFilter');

    addItemField.simulate('change', {target: {value: 'Flibble'}});
    submitBtn.simulate('submit');
    el.find('.remove-filter').simulate('click');

    assert.ok(spy.calledOnce);
  });

  it('should not add empty filters', () => {
    const submitBtn = el.find('[type="submit"]'),
      addItemField = el.find('.js-changes-filter-field');

    addItemField.simulate('change', {target: {value: ''}});
    submitBtn.simulate('submit');

    assert.equal(0, el.find('.remove-filter').length);
  });

  it('should not add tooltips by default', () => {
    assert.equal(0, el.find('.remove-filter').length);
  });

  it('should not add the same filter twice', () => {
    const submitBtn = el.find('[type="submit"]'),
        addItemField = el.find('.js-changes-filter-field');

    const filter = 'I am unique in the whole wide world';
    addItemField.simulate('change', {target: {value: filter}});
    submitBtn.simulate('submit');

    addItemField.simulate('change', {target: {value: filter}});
    submitBtn.simulate('submit');

    assert.equal(1, el.find('.remove-filter').length);
  });
});


describe('ChangesController', () => {
  let  headerEl, changesEl;

  const results = [
    { id: 'doc_1', seq: 4, deleted: false, changes: { code: 'here' } },
    { id: 'doc_2', seq: 1, deleted: false, changes: { code: 'here' } },
    { id: 'doc_3', seq: 6, deleted: true, changes: { code: 'here' } },
    { id: 'doc_4', seq: 7, deleted: false, changes: { code: 'here' } },
    { id: 'doc_5', seq: 1, deleted: true, changes: { code: 'here' } }
  ];

  const changesResponse = {
    last_seq: 123,
    'results': results
  };

  beforeEach(() => {
    Actions.initChanges({ databaseName: 'testDatabase' });
    headerEl  = mount(<Changes.ChangesTabContent />);
    changesEl = mount(<Changes.ChangesController />);
    Actions.updateChanges(changesResponse);
  });

  afterEach(() => {
    Stores.changesStore.reset();
  });


  it('should list the right number of changes', () => {
    assert.equal(results.length, changesEl.find('.change-box').length);
  });


  it('"false"/"true" filter strings should apply to change deleted status', () => {
    // add a filter
    const addItemField = headerEl.find('.js-changes-filter-field');
    const submitBtn = headerEl.find('[type="submit"]');
    addItemField.value = 'true';
    addItemField.simulate('change', {target: {value: 'true'}});
    submitBtn.simulate('submit');

    // confirm only the two deleted items shows up and the IDs maps to the deleted rows
    assert.equal(2, changesEl.find('.change-box').length);
    assert.equal('doc_3', changesEl.find('.js-doc-id').first().text());
    assert.equal('doc_5', changesEl.find('.js-doc-id').at(1).text());
  });


  it('confirms that a filter affects the actual search results', () => {
    // add a filter
    const addItemField = headerEl.find('.js-changes-filter-field');
    const submitBtn = headerEl.find('[type="submit"]');
    addItemField.simulate('change', {target: {value: '6'}});
    submitBtn.simulate('submit');

    // confirm only one item shows up and the ID maps to what we'd expect
    assert.equal(1, changesEl.find('.change-box').length);
    assert.equal('doc_3', changesEl.find('.js-doc-id').first().text());
  });


  // confirms that if there are multiple filters, ALL are applied to return the subset of results that match
  // all filters
  it('multiple filters should all be applied to results', () => {
    // add the filters
    const addItemField = headerEl.find('.js-changes-filter-field');
    const submitBtn = headerEl.find('[type="submit"]');

    // *** should match doc_1, doc_2 and doc_5
    addItemField.simulate('change', {target: {value: '1'}});
    submitBtn.simulate('submit');

    // *** should match doc_3 and doc_5
    addItemField.simulate('change', {target: {value: 'true'}});
    submitBtn.simulate('submit');

    // confirm only one item shows up and that it's doc_5
    assert.equal(1, changesEl.find('.change-box').length);
    assert.equal('doc_5', changesEl.find('.js-doc-id').first().text());
  });

  it('shows a No Docs Found message if no docs', () => {
    Stores.changesStore.reset();
    Actions.updateChanges({ last_seq: 124, results: [] });
    assert.ok(/There\sare\sno\sdocument\schanges/.test(changesEl.html()));
  });
});


describe('ChangesController max results', () => {
  let changesEl;
  const maxChanges = 10;


  beforeEach(() => {
    const changes = [];
    _.times(maxChanges + 10, (i) => {
      changes.push({ id: 'doc_' + i, seq: 1, changes: { code: 'here' } });
    });

    const response = {
      last_seq: 1,
      results: changes
    };

    Actions.initChanges({ databaseName: 'test' });

    // to keep the test speedy, override the default value (1000)
    Stores.changesStore.setMaxChanges(maxChanges);

    Actions.updateChanges(response);
    changesEl = mount(<Changes.ChangesController />);
  });

  afterEach(() => {
    Stores.changesStore.reset();
  });

  it('should truncate the number of results with very large # of changes', () => {
    // check there's no more than maxChanges results
    assert.equal(maxChanges, changesEl.find('.change-box').length);
  });

  it('should show a message if the results are truncated', () => {
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
    const changeRow = mount(<Changes.ChangeRow change={change} databaseName="testDatabase" />);

    // confirm it's hidden by default
    assert.equal(0, changeRow.find('.prettyprint').length);

    // confirm clicking it shows the element
    changeRow.find('button.btn').simulate('click');
    assert.equal(1, changeRow.find('.prettyprint').length);
  });

  it('deleted docs should not be clickable', () => {
    change.deleted = true;
    const changeRow = mount(<Changes.ChangeRow change={change} databaseName="testDatabase" />);
    assert.equal(0, changeRow.find('a.js-doc-link').length);
  });

  it('non-deleted docs should be clickable', () => {
    change.deleted = false;
    const changeRow = mount(<Changes.ChangeRow change={change} databaseName="testDatabase" />);
    assert.equal(1, changeRow.find('a.js-doc-link').length);
  });
});
