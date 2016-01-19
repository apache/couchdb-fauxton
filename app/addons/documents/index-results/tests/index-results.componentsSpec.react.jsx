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
  'addons/documents/index-results/index-results.components.react',
  'addons/documents/index-results/actions',
  'addons/documents/index-results/stores',
  'addons/documents/resources',
  'addons/databases/resources',
  'addons/documents/tests/document-test-helper',
  'testUtils',
  "react",
  'react-dom'
], function (FauxtonAPI, Views, IndexResultsActions, Stores, Documents, Databases, documentTestHelper, utils, React, ReactDOM) {
  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;
  var store = Stores.indexResultsStore;
  var createDocColumn = documentTestHelper.createDocColumn;
  var createMangoIndexDocColumn = documentTestHelper.createMangoIndexDocColumn;

  describe('Index Results', function () {
    var container, instance;

    describe('no results text', function () {
      beforeEach(function () {
        container = document.createElement('div');
        store.reset();
      });

      afterEach(function () {
        ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(instance).parentNode);
        store.reset();
      });

      it('renders a default text', function () {
        IndexResultsActions.newResultsList({
          collection: [],
          bulkCollection: new Documents.BulkDeleteDocCollection([], {databaseId: '1'}),
        });
        IndexResultsActions.resultsListReset();

        instance = TestUtils.renderIntoDocument(<Views.List />, container);
        var $el = $(ReactDOM.findDOMNode(instance));
        assert.equal($el.text(), 'No Index Created Yet!');
      });

      it('you can change the default text', function () {
        IndexResultsActions.newResultsList({
          collection: {
            forEach: function () {},
            filter: function () { return []; },
            fetch: function () {
              return {
                then: function (cb) {
                  cb();
                }
              };
            }
          },
          bulkCollection: new Documents.BulkDeleteDocCollection([], {databaseId: '1'}),
          textEmptyIndex: 'I <3 Hamburg'
        });


        instance = TestUtils.renderIntoDocument(<Views.List />, container);
        var $el = $(ReactDOM.findDOMNode(instance));
        assert.equal($el.text(), 'I <3 Hamburg');
      });
    });

    describe('checkbox rendering', function () {
      var opts = {
        params: {},
        database: {
          safeID: function () { return '1';}
        }
      };

      beforeEach(function () {
        container = document.createElement('div');
        store.reset();
      });

      afterEach(function () {
        ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(instance).parentNode);
        store.reset();
      });

      it('does not render checkboxes for elements with just the special index (Mango Index List)', function () {
        IndexResultsActions.sendMessageNewResultList({
          collection: createMangoIndexDocColumn([{foo: 'testId1', type: 'special'}]),
          bulkCollection: new Documents.BulkDeleteDocCollection([], {databaseId: '1'}),
        });

        store.toggleTableView({enable: true});

        IndexResultsActions.resultsListReset();

        instance = TestUtils.renderIntoDocument(
          <Views.List />,
          container
        );

        var $el = $(ReactDOM.findDOMNode(instance));

        assert.ok($el.find('.tableview-checkbox-cell input').length === 0);
      });

      it('renders checkboxes for elements with more than just the the special index (Mango Index List)', function () {
        IndexResultsActions.sendMessageNewResultList({
          collection: createMangoIndexDocColumn([{
            ddoc: null,
            name: 'biene',
            type: 'json',
            def: {fields: [{_id: 'desc'}]}
          },
          {
            ddoc: null,
            name: 'biene',
            type: 'special',
            def: {fields: [{_id: 'desc'}]}
          }]),
          bulkCollection: new Documents.BulkDeleteDocCollection([], {databaseId: '1'}),
        });

        store.toggleTableView({enable: true});

        IndexResultsActions.resultsListReset();

        instance = TestUtils.renderIntoDocument(
          <Views.List />,
          container
        );

        var $el = $(ReactDOM.findDOMNode(instance));

        assert.ok($el.find('.tableview-checkbox-cell input').length > 0);
      });

      it('does not render checkboxes for elements with no id in a table (usual docs)', function () {
        IndexResultsActions.sendMessageNewResultList({
          collection: createDocColumn([{
            ddoc: null,
            name: 'biene',
            type: 'special',
            def: {fields: [{_id: 'desc'}]}
          }]),
          bulkCollection: new Documents.BulkDeleteDocCollection([], {databaseId: '1'}),
        });

        store.toggleTableView({enable: true});

        IndexResultsActions.resultsListReset();

        instance = TestUtils.renderIntoDocument(
          <Views.List />,
          container
        );

        var $el = $(ReactDOM.findDOMNode(instance));

        assert.ok($el.find('.tableview-checkbox-cell input').length === 0);
      });

      it('does not render checkboxes for elements with no rev in a table (usual docs)', function () {
        IndexResultsActions.sendMessageNewResultList({
          collection: createDocColumn([{id: '1', foo: 'testId1'}, {id: '1', bar: 'testId1'}]),
          bulkCollection: new Documents.BulkDeleteDocCollection([], {databaseId: '1'}),
        });

        store.toggleTableView({enable: true});

        IndexResultsActions.resultsListReset();

        instance = TestUtils.renderIntoDocument(
          <Views.List />,
          container
        );

        var $el = $(ReactDOM.findDOMNode(instance));

        assert.ok($el.find('.tableview-checkbox-cell input').length === 0);
      });

      it('renders checkboxes for elements with an id and rev in a table (usual docs)', function () {
        IndexResultsActions.sendMessageNewResultList({
          collection: createDocColumn([{id: '1', foo: 'testId1', rev: 'foo'}, {bar: 'testId1', rev: 'foo'}]),
          bulkCollection: new Documents.BulkDeleteDocCollection([], {databaseId: '1'}),
        });

        store.toggleTableView({enable: true});

        IndexResultsActions.resultsListReset();

        instance = TestUtils.renderIntoDocument(
          <Views.List />,
          container
        );

        var $el = $(ReactDOM.findDOMNode(instance));

        assert.ok($el.find('.tableview-checkbox-cell input').length > 0);
      });

      it('renders checkboxes for elements with an id and rev in a json view (usual docs)', function () {
        IndexResultsActions.sendMessageNewResultList({
          collection: createDocColumn([{id: '1', emma: 'testId1', rev: 'foo'}, {bar: 'testId1'}]),
          bulkCollection: new Documents.BulkDeleteDocCollection([], {databaseId: '1'}),
        });

        IndexResultsActions.resultsListReset();

        store.toggleTableView({enable: false});

        instance = TestUtils.renderIntoDocument(
          <Views.List />,
          container
        );

        var $el = $(ReactDOM.findDOMNode(instance));
        assert.ok($el.find('.js-row-select').length > 0);
      });

      it('does not render checkboxes for elements with that are not deletable in a json view (usual docs)', function () {
        IndexResultsActions.sendMessageNewResultList({
          collection: createDocColumn([{foo: 'testId1', rev: 'foo'}, {bar: 'testId1'}]),
          bulkCollection: new Documents.BulkDeleteDocCollection([], {databaseId: '1'}),
        });

        IndexResultsActions.resultsListReset();

        store.toggleTableView({enable: false});

        instance = TestUtils.renderIntoDocument(
          <Views.List />,
          container
        );

        var $el = $(ReactDOM.findDOMNode(instance));

        assert.notOk($el.hasClass('show-select'));
      });

    });

    describe('cellcontent', function () {
      beforeEach(function () {
        container = document.createElement('div');
        store.reset();
      });

      afterEach(function () {
        ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(instance).parentNode);
        store.reset();
      });

      it('formats title elements for better readability', function () {
        var doc = {object: {a: 1, foo: [1, 2, 3]}};

        IndexResultsActions.sendMessageNewResultList({
          collection: createDocColumn([doc]),
          bulkCollection: new Documents.BulkDeleteDocCollection([], {databaseId: '1'}),
        });

        store.toggleTableView({enable: true});

        IndexResultsActions.resultsListReset();

        instance = TestUtils.renderIntoDocument(
          <Views.List />,
          container
        );

        var $el = $(ReactDOM.findDOMNode(instance));
        var $targetNode = $el.find('td.tableview-el-last').prev();

        var formattedDoc = JSON.stringify(doc.object, null, '  ');
        assert.equal($targetNode.attr('title'), formattedDoc);
      });

    });
    describe('wrapped autocomplete', function () {
      it('renders a filter icon if no text given', function () {

        var elements = ['min_weight', 'max_weight'];

        instance = TestUtils.renderIntoDocument(
          <Views.WrappedAutocomplete selectedField="ente" />,
          container
        );

        var $el = $(ReactDOM.findDOMNode(instance));

        assert.equal($el.find('.icon-filter').length, 0);

        var node = $el.find('input')[0];
        node.value = '';
        TestUtils.Simulate.change(node);
        assert.equal($el.find('.icon-filter').length, 1);
      });
    });

    describe('loading', function () {
      beforeEach(function () {
        container = document.createElement('div');
        store.reset();
      });

      afterEach(function () {
        ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(instance).parentNode);
        store.reset();
      });

      it('should show loading component', function () {
        var results = {results: []};
        instance = TestUtils.renderIntoDocument(
          <Views.ResultsScreen results={results} isLoading={true} />,
          container
        );

        var $el = $(ReactDOM.findDOMNode(instance));

        assert.ok($el.find('.loading-lines').length === 1);
      });

      it('should not show loading component', function () {
        var results = {results: []};
        instance = TestUtils.renderIntoDocument(
          <Views.ResultsScreen results={results} isLoading={false} />,
          container
        );

        var $el = $(ReactDOM.findDOMNode(instance));

        assert.ok($el.find('.loading-lines').length === 0);
      });
    });

  });
});
