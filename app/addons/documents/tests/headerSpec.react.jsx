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

  // importing the legacy
  'addons/documents/views',
  'addons/documents/resources',
  'addons/databases/base',
  'addons/fauxton/components',
  'addons/documents/pagination/actions',

  'testUtils',
  'react'
], function (FauxtonAPI, Views, Stores, Actions, Documents, Resources, Databases, Components, PaginationActions, utils, React) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;

  describe('Header Controller', function () {
    var container, toggleEl;
    beforeEach(function () {
      container = document.createElement('div');
      Actions.resetHeaderController();
    });

    afterEach(function () {
      React.unmountComponentAtNode(container);
    });

    it('should use the passed classname', function () {
      toggleEl = TestUtils.renderIntoDocument(<Views.HeaderBarController />, container);
      var $el = $(toggleEl.getDOMNode()).find('.control-toggle-alternative-header');
      TestUtils.Simulate.click($el[0]);
      assert.ok($el.hasClass('js-headerbar-togglebutton-selected'));
    });

    it('should not render the alternative header if the button is not clicked', function () {
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
    var container, header, viewSandbox, bulkDeleteDocCollection;
    beforeEach(function () {
      // needed for "pressing SelectAll should fill the delete-bulk-docs-collection"
      var ViewSandbox = utils.ViewSandbox;
      var database = new Databases.Model({id: 'registry'});
      bulkDeleteDocCollection = new Resources.BulkDeleteDocCollection([], {databaseId: 'registry'});

      database.allDocs = new Resources.AllDocs({_id: "ente"}, {
        database: database,
        viewMeta: {update_seq: 1},
        params: {}
      });

      PaginationActions.newPagination(database.allDocs);

      var view = new Documents.Views.AllDocsList({
        viewList: false,
        bulkDeleteDocsCollection: bulkDeleteDocCollection,
        collection: database.allDocs,
      });

      viewSandbox = new ViewSandbox();
      viewSandbox.renderView(view);


      container = document.createElement('div');
    });

    afterEach(function () {
      bulkDeleteDocCollection.off();
      viewSandbox.remove();

      React.unmountComponentAtNode(container);
    });

    it('should trigger an event to communicate with the backbone elements', function () {
      var spy = sinon.spy(FauxtonAPI.Events, 'trigger');
      header = TestUtils.renderIntoDocument(<Views.BulkDocumentHeaderController />, container);
      TestUtils.Simulate.click($(header.getDOMNode()).find('.control-collapse')[0]);

      assert.ok(spy.calledOnce);
    });

    it('pressing SelectAll should fill the delete-bulk-docs-collection', function () {
      TestUtils.Simulate.click($(header.getDOMNode()).find('.control-select-all')[0]);

      assert.equal(bulkDeleteDocCollection.length, 1);
    });
  });
});
