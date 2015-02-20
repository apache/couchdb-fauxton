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
  'app',
  'api',
  'react',
  'addons/documents/changes/components.react',
  'addons/documents/changes/stores',
  'addons/documents/changes/actions',
  'testUtils'
], function (app, FauxtonAPI, React, Changes, Stores, Actions, utils) {
  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;


  describe('ChangesHeader', function () {
    var container, tab, spy;

    describe('Testing DOM', function () {
      beforeEach(function () {
        spy = sinon.spy(Actions, 'toggleTabVisibility');
        container = document.createElement('div');
        tab = TestUtils.renderIntoDocument(<Changes.ChangesHeader />, container);
      });

      afterEach(function () {
        Stores.changesFilterStore.reset();
        React.unmountComponentAtNode(container);
      });

      // similar as previous, except it confirms that the action gets fired, not the custom toggle func
      it('calls toggleTabVisibility action on selecting a tab', function () {
        TestUtils.Simulate.click($(tab.getDOMNode()).find('a')[0]);
        assert.ok(spy.calledOnce);
      });
    });
  });

  describe('ChangesHeaderTab', function () {
    var container, tab, toggleTabVisibility;

    beforeEach(function () {
      toggleTabVisibility = sinon.spy();
      container = document.createElement('div');
      tab = TestUtils.renderIntoDocument(<Changes.ChangesHeaderTab onToggle={toggleTabVisibility} />, container);
    });

    afterEach(function () {
      Stores.changesFilterStore.reset();
      React.unmountComponentAtNode(container);
    });

    it('should call toggle function on clicking tab', function () {
      TestUtils.Simulate.click($(tab.getDOMNode()).find('a')[0]);
      assert.ok(toggleTabVisibility.calledOnce);
    });
  });


  describe('ChangesFilter', function () {
    var container, changesFilterEl;

    beforeEach(function () {
      container = document.createElement('div');
      changesFilterEl = TestUtils.renderIntoDocument(<Changes.ChangesFilter />, container);
    });

    afterEach(function () {
      Stores.changesFilterStore.reset();
      React.unmountComponentAtNode(container);
    });

    it('should add filter markup', function () {
      var $el = $(changesFilterEl.getDOMNode()),
          submitBtn = $el.find('[type="submit"]')[0],
          addItemField = $el.find('.js-changes-filter-field')[0];

      addItemField.value = 'I wandered lonely as a filter';
      TestUtils.Simulate.change(addItemField);
      TestUtils.Simulate.submit(submitBtn);

      addItemField.value = 'A second filter';
      TestUtils.Simulate.change(addItemField);
      TestUtils.Simulate.submit(submitBtn);

      assert.equal(2, $el.find('.js-remove-filter').length);
    });

    it('should call addFilter action on click', function () {
      var $el = $(changesFilterEl.getDOMNode()),
        submitBtn = $el.find('[type="submit"]')[0],
        addItemField = $el.find('.js-changes-filter-field')[0];

      var spy = sinon.spy(Actions, 'addFilter');

      addItemField.value = 'I wandered lonely as a filter';
      TestUtils.Simulate.change(addItemField);
      TestUtils.Simulate.submit(submitBtn);

      assert.ok(spy.calledOnce);
    });

    it('should remove filter markup', function () {
      var $el = $(changesFilterEl.getDOMNode()),
        submitBtn = $el.find('[type="submit"]')[0],
        addItemField = $el.find('.js-changes-filter-field')[0];

      addItemField.value = 'Bloop';
      TestUtils.Simulate.change(addItemField);
      TestUtils.Simulate.submit(submitBtn);

      addItemField.value = 'Flibble';
      TestUtils.Simulate.change(addItemField);
      TestUtils.Simulate.submit(submitBtn);

      // clicks ALL 'remove' elements
      TestUtils.Simulate.click($el.find('.js-remove-filter')[0]);
      TestUtils.Simulate.click($el.find('.js-remove-filter')[0]);

      assert.equal(0, $el.find('.js-remove-filter').length);
    });

    it('should call removeFilter action on click', function () {
      var $el = $(changesFilterEl.getDOMNode()),
        submitBtn = $el.find('[type="submit"]')[0],
        addItemField = $el.find('.js-changes-filter-field')[0];

      var spy = sinon.spy(Actions, 'removeFilter');

      addItemField.value = 'I wandered lonely as a filter';
      TestUtils.Simulate.change(addItemField);
      TestUtils.Simulate.submit(submitBtn);
      TestUtils.Simulate.click($el.find('.js-remove-filter')[0]);

      assert.ok(spy.calledOnce);
    });

    it('should not add empty filters', function () {
      var $el = $(changesFilterEl.getDOMNode()),
        submitBtn = $el.find('[type="submit"]')[0],
        addItemField = $el.find('.js-changes-filter-field')[0];

      addItemField.value = '';
      TestUtils.Simulate.change(addItemField);
      TestUtils.Simulate.submit(submitBtn);

      assert.equal(0, $el.find('.js-remove-filter').length);
    });

    it('should not add tooltips by default', function () {
      assert.equal(0, $(changesFilterEl.getDOMNode()).find('.js-remove-filter').length);
    });

    it('should not add the same filter twice', function () {
      var $el = $(changesFilterEl.getDOMNode()),
        submitBtn = $el.find('[type="submit"]')[0],
        addItemField = $el.find('.js-changes-filter-field')[0];

      var filter = 'I am unique in the whole wide world';
      addItemField.value = filter;
      TestUtils.Simulate.change(addItemField);
      TestUtils.Simulate.submit(submitBtn);

      addItemField.value = filter;
      TestUtils.Simulate.change(addItemField);
      TestUtils.Simulate.submit(submitBtn);

      assert.equal(1, $el.find('.js-remove-filter').length);
    });

  });

});
