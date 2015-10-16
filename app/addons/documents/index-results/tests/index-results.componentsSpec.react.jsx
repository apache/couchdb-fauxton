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
  'testUtils',
  "react"
], function (FauxtonAPI, Views, IndexResultsActions, Stores, Documents, Databases, utils, React) {
  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;
  var store = Stores.indexResultsStore;

  describe('Index Results', function () {
    var container, instance;

    describe('no results text', function () {
      beforeEach(function () {
        container = document.createElement('div');
        store.reset();
      });

      afterEach(function () {
        React.unmountComponentAtNode(React.findDOMNode(instance).parentNode);
        store.reset();
      });

      it('renders a default text', function () {
        IndexResultsActions.newResultsList({
          collection: [],
          deleteable: true
        });
        IndexResultsActions.resultsListReset();

        instance = TestUtils.renderIntoDocument(<Views.List />, container);
        var $el = $(instance.getDOMNode());
        assert.equal($el.text(), 'No Index Created Yet!');
      });

      it('you can change the default text', function () {
        IndexResultsActions.newResultsList({
          collection: [],
          deleteable: true,
          textEmptyIndex: 'I <3 Hamburg'
        });

        instance = TestUtils.renderIntoDocument(<Views.List />, container);
        var $el = $(instance.getDOMNode());
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
        React.unmountComponentAtNode(React.findDOMNode(instance).parentNode);
        store.reset();
      });

      function createDocColumn (docs) {
        docs = docs.map(function (doc) {
          return Documents.Doc.prototype.parse(doc);
        });

        return new Documents.AllDocs(docs, opts);
      }

      it('does not render checkboxes for elements with no id in a table', function () {
        IndexResultsActions.sendMessageNewResultList({
          collection: createDocColumn([{foo: 'testId1'}, {bar: 'testId1'}])
        });

        store.enableTableView();

        IndexResultsActions.resultsListReset();

        instance = TestUtils.renderIntoDocument(
          <Views.List />,
          container
        );

        var $el = $(instance.getDOMNode());

        assert.ok($el.find('.tableview-header-el-checkbox').length === 0);
      });

      it('renders checkboxes for elements with id in a table', function () {
        IndexResultsActions.sendMessageNewResultList({
          collection: createDocColumn([{id: '1', foo: 'testId1'}, {bar: 'testId1'}])
        });

        store.enableTableView();

        IndexResultsActions.resultsListReset();

        instance = TestUtils.renderIntoDocument(
          <Views.List />,
          container
        );

        var $el = $(instance.getDOMNode());

        assert.ok($el.find('.tableview-checkbox-cell').length > 0);
      });

      it('renders checkboxes for elements with an id in a json view', function () {
        IndexResultsActions.sendMessageNewResultList({
          collection: createDocColumn([{id: '1', foo: 'testId1'}, {bar: 'testId1'}])
        });

        IndexResultsActions.resultsListReset();

        store.disableTableView();

        instance = TestUtils.renderIntoDocument(
          <Views.List />,
          container
        );

        var $el = $(instance.getDOMNode());

        assert.ok($el.find('.js-row-select').length > 0);
      });

      it('does not render checkboxes for elements with no id in a json view', function () {
        IndexResultsActions.sendMessageNewResultList({
          collection: createDocColumn([{foo: 'testId1'}, {bar: 'testId1'}])
        });

        IndexResultsActions.resultsListReset();

        store.disableTableView();

        instance = TestUtils.renderIntoDocument(
          <Views.List />,
          container
        );

        var $el = $(instance.getDOMNode());

        assert.notOk($el.hasClass('show-select'));
      });

    });

    describe('loading', function () {
      beforeEach(function () {
        container = document.createElement('div');
        store.reset();
      });

      afterEach(function () {
        React.unmountComponentAtNode(React.findDOMNode(instance).parentNode);
        store.reset();
      });

      it('should show loading component', function () {
        var results = {results: []};
        instance = TestUtils.renderIntoDocument(
          <Views.ResultsScreen results={results} isLoading={true} />,
          container
        );

        var $el = $(instance.getDOMNode());

        assert.ok($el.find('.loading-lines').length === 1);
      });

      it('should not show loading component', function () {
        var results = {results: []};
        instance = TestUtils.renderIntoDocument(
          <Views.ResultsScreen results={results} isLoading={false} />,
          container
        );

        var $el = $(instance.getDOMNode());

        assert.ok($el.find('.loading-lines').length === 0);
      });
    });

  });
});
