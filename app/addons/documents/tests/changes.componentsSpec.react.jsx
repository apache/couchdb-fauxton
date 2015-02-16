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
  'testUtils'
], function (app, FauxtonAPI, React, Changes, Stores, utils) {
  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;

  describe('ChangesHeader', function () {
    describe('Toggle tab content button', function () {
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


    it('should add tooltips when some text is supplied', function () {
      var customContainer = document.createElement('div');
      var customChangesFilterEl = TestUtils.renderIntoDocument(<Changes.ChangesFilter tooltip="holy cow this is a tooltip" />, customContainer);
      assert.equal(1, $(customChangesFilterEl.getDOMNode()).find('.js-filter-tooltip').length);
    });
  });

});
