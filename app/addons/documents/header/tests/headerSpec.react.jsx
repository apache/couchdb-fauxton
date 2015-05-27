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
  'addons/documents/header/header.react',
  'addons/documents/header/header.stores',
  'addons/documents/header/header.actions',

  'addons/databases/base',
  'addons/documents/resources',
  'addons/documents/index-results/actions',
  'addons/documents/index-results/stores',

  'testUtils',
  'react'
], function (FauxtonAPI, Views, Stores, Actions, Databases, Resources,
             IndexResultsActions, IndexResultsStore, utils, React) {

  var assert = utils.assert;
  var restore = utils.restore;
  var TestUtils = React.addons.TestUtils;

  describe('Header Controller', function () {
    var container, toggleEl;
    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      React.unmountComponentAtNode(container);
    });

    it('should not include invalid calssname', function () {
      toggleEl = TestUtils.renderIntoDocument(<Views.HeaderBarController />, container);
      var $el = $(toggleEl.getDOMNode()).find('.control-toggle-alternative-header');
      assert.equal($(toggleEl.getDOMNode()).find('.undefined').length, 0);
    });

    it('should use the passed classname', function () {
      toggleEl = TestUtils.renderIntoDocument(<Views.HeaderBarController />, container);
      var $el = $(toggleEl.getDOMNode()).find('.control-toggle-alternative-header');

      TestUtils.Simulate.click($el[0]);
      assert.ok($el.hasClass('js-headerbar-togglebutton-selected'));
    });

    it('should not render the alternative header if the button is not clicked', function () {
      Actions.resetHeaderController();
      toggleEl = TestUtils.renderIntoDocument(<Views.HeaderBarController />, container);
      var $el = $(toggleEl.getDOMNode()).find('.control-toggle-alternative-header');
      assert.equal($(toggleEl.getDOMNode()).find('.alternative-header').length, 0);
    });

    it('should render the alternative header', function () {
      toggleEl = TestUtils.renderIntoDocument(<Views.HeaderBarController />, container);
      var $el = $(toggleEl.getDOMNode()).find('.control-toggle-alternative-header');
      TestUtils.Simulate.click($el[0]);
      assert.equal($(toggleEl.getDOMNode()).find('.alternative-header').length, 1);
    });
  });

  describe('Bulkdocument Headerbar Controller', function () {
    var container, header;
    beforeEach(function () {
      var database = new Databases.Model({id: 'registry'});

      database.allDocs = new Resources.AllDocs({_id: "ente"}, {
        database: database,
        viewMeta: {update_seq: 1},
        params: {}
      });

      //override reset so we don't loose the added doc needed for testing
      database.allDocs.reset = function () {};

      IndexResultsActions.newResultsList({
        collection: database.allDocs,
        isListDeletable: false
      });


      container = document.createElement('div');
    });

    afterEach(function () {
      React.unmountComponentAtNode(container);
      restore(Actions.collapseDocuments);
    });

    it('should trigger action', function () {
      var spy = sinon.spy(Actions, 'collapseDocuments');
      header = TestUtils.renderIntoDocument(<Views.BulkDocumentHeaderController />, container);
      TestUtils.Simulate.click($(header.getDOMNode()).find('.control-collapse')[0]);

      assert.ok(spy.calledOnce);
    });

    it('pressing SelectAll should fill the selected items list', function () {
      TestUtils.Simulate.click($(header.getDOMNode()).find('.control-select-all')[0]);

      assert.equal(IndexResultsStore.indexResultsStore.getSelectedItemsLength(), 1);
    });
  });
});
