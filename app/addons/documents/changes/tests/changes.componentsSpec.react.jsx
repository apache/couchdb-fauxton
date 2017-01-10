
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
import Changes from "../components.react";
import Stores from "../stores";
import Actions from "../actions";
import utils from "../../../../../test/mocha/testUtils";
import TestUtils from "react-addons-test-utils";
import sinon from "sinon";

var assert = utils.assert;


describe('ChangesTabContent', function () {
  var container, changesFilterEl;

  beforeEach(function () {
    container = document.createElement('div');
    changesFilterEl = TestUtils.renderIntoDocument(<Changes.ChangesTabContent />, container);
  });

  afterEach(function () {
    Stores.changesStore.reset();
    ReactDOM.unmountComponentAtNode(container);
  });

  it('should add filter markup', function () {
    var $el = $(ReactDOM.findDOMNode(changesFilterEl)),
        submitBtn = $el.find('[type="submit"]')[0],
        addItemField = $el.find('.js-changes-filter-field')[0];

    addItemField.value = 'I wandered lonely as a filter';
    TestUtils.Simulate.change(addItemField);
    TestUtils.Simulate.submit(submitBtn);

    addItemField.value = 'A second filter';
    TestUtils.Simulate.change(addItemField);
    TestUtils.Simulate.submit(submitBtn);

    assert.equal(2, $el.find('.remove-filter').length);
  });

  it('should call addFilter action on click', function () {
    var $el = $(ReactDOM.findDOMNode(changesFilterEl)),
      submitBtn = $el.find('[type="submit"]')[0],
      addItemField = $el.find('.js-changes-filter-field')[0];

    var spy = sinon.spy(Actions, 'addFilter');

    addItemField.value = 'I wandered lonely as a filter';
    TestUtils.Simulate.change(addItemField);
    TestUtils.Simulate.submit(submitBtn);

    assert.ok(spy.calledOnce);
  });

  it('should remove filter markup', function () {
    var $el = $(ReactDOM.findDOMNode(changesFilterEl)),
      submitBtn = $el.find('[type="submit"]')[0],
      addItemField = $el.find('.js-changes-filter-field')[0];

    addItemField.value = 'Bloop';
    TestUtils.Simulate.change(addItemField);
    TestUtils.Simulate.submit(submitBtn);

    addItemField.value = 'Flibble';
    TestUtils.Simulate.change(addItemField);
    TestUtils.Simulate.submit(submitBtn);

    // clicks ALL 'remove' elements
    TestUtils.Simulate.click($el.find('.remove-filter')[0]);
    TestUtils.Simulate.click($el.find('.remove-filter')[0]);

    assert.equal(0, $el.find('.remove-filter').length);
  });

  it('should call removeFilter action on click', function () {
    var $el = $(ReactDOM.findDOMNode(changesFilterEl)),
      submitBtn = $el.find('[type="submit"]')[0],
      addItemField = $el.find('.js-changes-filter-field')[0];

    var spy = sinon.spy(Actions, 'removeFilter');

    addItemField.value = 'I wandered lonely as a filter';
    TestUtils.Simulate.change(addItemField);
    TestUtils.Simulate.submit(submitBtn);
    TestUtils.Simulate.click($el.find('.remove-filter')[0]);

    assert.ok(spy.calledOnce);
  });

  it('should not add empty filters', function () {
    var $el = $(ReactDOM.findDOMNode(changesFilterEl)),
      submitBtn = $el.find('[type="submit"]')[0],
      addItemField = $el.find('.js-changes-filter-field')[0];

    addItemField.value = '';
    TestUtils.Simulate.change(addItemField);
    TestUtils.Simulate.submit(submitBtn);

    assert.equal(0, $el.find('.remove-filter').length);
  });

  it('should not add tooltips by default', function () {
    assert.equal(0, $(ReactDOM.findDOMNode(changesFilterEl)).find('.remove-filter').length);
  });

  it('should not add the same filter twice', function () {
    var $el = $(ReactDOM.findDOMNode(changesFilterEl)),
        submitBtn = $el.find('[type="submit"]')[0],
        addItemField = $el.find('.js-changes-filter-field')[0];

    var filter = 'I am unique in the whole wide world';
    addItemField.value = filter;
    TestUtils.Simulate.change(addItemField);
    TestUtils.Simulate.submit(submitBtn);

    addItemField.value = filter;
    TestUtils.Simulate.change(addItemField);
    TestUtils.Simulate.submit(submitBtn);

    assert.equal(1, $el.find('.remove-filter').length);
  });
});


describe('ChangesController', function () {
  var container, container2, headerEl, $headerEl, changesEl, $changesEl;

  var results = [
    { id: 'doc_1', seq: 4, deleted: false, changes: { code: 'here' } },
    { id: 'doc_2', seq: 1, deleted: false, changes: { code: 'here' } },
    { id: 'doc_3', seq: 6, deleted: true, changes: { code: 'here' } },
    { id: 'doc_4', seq: 7, deleted: false, changes: { code: 'here' } },
    { id: 'doc_5', seq: 1, deleted: true, changes: { code: 'here' } }
  ];
  var changesResponse = {
    last_seq: 123,
    'results': results
  };

  beforeEach(function () {
    container = document.createElement('div');
    container2 = document.createElement('div');
    Actions.initChanges({ databaseName: 'testDatabase' });
    headerEl  = TestUtils.renderIntoDocument(<Changes.ChangesTabContent />, container);
    $headerEl = $(ReactDOM.findDOMNode(headerEl));
    changesEl = TestUtils.renderIntoDocument(<Changes.ChangesController />, container2);
    $changesEl = $(ReactDOM.findDOMNode(changesEl));
    Actions.updateChanges(changesResponse);
  });

  afterEach(function () {
    Stores.changesStore.reset();
    ReactDOM.unmountComponentAtNode(container);
    ReactDOM.unmountComponentAtNode(container2);
  });


  it('should list the right number of changes', function () {
    assert.equal(results.length, $changesEl.find('.change-box').length);
  });


  it('"false"/"true" filter strings should apply to change deleted status', function () {
    // add a filter
    var addItemField = $headerEl.find('.js-changes-filter-field')[0];
    var submitBtn = $headerEl.find('[type="submit"]')[0];
    addItemField.value = 'true';
    TestUtils.Simulate.change(addItemField);
    TestUtils.Simulate.submit(submitBtn);

    // confirm only the two deleted items shows up and the IDs maps to the deleted rows
    assert.equal(2, $changesEl.find('.change-box').length);
    assert.equal('doc_3', $($changesEl.find('.js-doc-id').get(0)).html());
    assert.equal('doc_5', $($changesEl.find('.js-doc-id').get(1)).html());
  });


  it('confirms that a filter affects the actual search results', function () {
    // add a filter
    var addItemField = $headerEl.find('.js-changes-filter-field')[0];
    var submitBtn = $headerEl.find('[type="submit"]')[0];
    addItemField.value = '6'; // should match doc_3's sequence ID
    TestUtils.Simulate.change(addItemField);
    TestUtils.Simulate.submit(submitBtn);

    // confirm only one item shows up and the ID maps to what we'd expect
    assert.equal(1, $changesEl.find('.change-box').length);
    assert.equal('doc_3', $($changesEl.find('.js-doc-id').get(0)).html());
  });


  // confirms that if there are multiple filters, ALL are applied to return the subset of results that match
  // all filters
  it('multiple filters should all be applied to results', function () {
    // add the filters
    var addItemField = $headerEl.find('.js-changes-filter-field')[0];
    var submitBtn = $headerEl.find('[type="submit"]')[0];

    // *** should match doc_1, doc_2 and doc_5
    addItemField.value = '1';
    TestUtils.Simulate.change(addItemField);
    TestUtils.Simulate.submit(submitBtn);

    // *** should match doc_3 and doc_5
    addItemField.value = 'true';
    TestUtils.Simulate.change(addItemField);
    TestUtils.Simulate.submit(submitBtn);

    // confirm only one item shows up and that it's doc_5
    assert.equal(1, $changesEl.find('.change-box').length);
    assert.equal('doc_5', $($changesEl.find('.js-doc-id').get(0)).html());
  });

  it('shows a No Docs Found message if no docs', function () {
    Stores.changesStore.reset();
    Actions.updateChanges({ last_seq: 124, results: [] });
    assert.ok(/There\sare\sno\sdocument\schanges/.test($changesEl[0].outerHTML));
  });

});


describe('ChangesController max results', function () {
  var changesEl;
  var container;
  var maxChanges = 10;


  beforeEach(function () {
    container = document.createElement('div');
    var changes = [];
    _.times(maxChanges + 10, function (i) {
      changes.push({ id: 'doc_' + i, seq: 1, changes: { code: 'here' } });
    });

    var response = {
      last_seq: 1,
      results: changes
    };

    Actions.initChanges({ databaseName: 'test' });

    // to keep the test speedy, override the default value (1000)
    Stores.changesStore.setMaxChanges(maxChanges);

    Actions.updateChanges(response);
    changesEl = TestUtils.renderIntoDocument(<Changes.ChangesController />, container);
  });

  afterEach(function () {
    Stores.changesStore.reset();
    ReactDOM.unmountComponentAtNode(container);
  });

  it('should truncate the number of results with very large # of changes', function () {
    // check there's no more than maxChanges results
    assert.equal(maxChanges, $(ReactDOM.findDOMNode(changesEl)).find('.change-box').length);
  });

  it('should show a message if the results are truncated', function () {
    assert.equal(1, $(ReactDOM.findDOMNode(changesEl)).find('.changes-result-limit').length);
  });

});


describe('ChangeRow', function () {
  var container;
  var change = {
    id: '123',
    seq: 5,
    deleted: false,
    changes: { code: 'here' }
  };

  beforeEach(function () {
    container = document.createElement('div');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(container);
  });


  it('clicking the toggle-json button shows the code section', function () {
    var changeRow = TestUtils.renderIntoDocument(<Changes.ChangeRow change={change} databaseName="testDatabase" />, container);

    // confirm it's hidden by default
    assert.equal(0, $(ReactDOM.findDOMNode(changeRow)).find('.prettyprint').length);

    // confirm clicking it shows the element
    TestUtils.Simulate.click($(ReactDOM.findDOMNode(changeRow)).find('button.btn')[0]);
    assert.equal(1, $(ReactDOM.findDOMNode(changeRow)).find('.prettyprint').length);
  });

  it('deleted docs should not be clickable', function () {
    change.deleted = true;
    var changeRow = TestUtils.renderIntoDocument(<Changes.ChangeRow change={change} databaseName="testDatabase" />, container);
    assert.equal(0, $(ReactDOM.findDOMNode(changeRow)).find('a.js-doc-link').length);
  });

  it('non-deleted docs should be clickable', function () {
    change.deleted = false;
    var changeRow = TestUtils.renderIntoDocument(<Changes.ChangeRow change={change} databaseName="testDatabase" />, container);
    assert.equal(1, $(ReactDOM.findDOMNode(changeRow)).find('a.js-doc-link').length);
  });
});
