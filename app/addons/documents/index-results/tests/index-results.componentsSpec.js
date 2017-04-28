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
import FauxtonAPI from "../../../../core/api";
import Views from "../index-results.components";
import IndexResultsActions from "../actions";
import Stores from "../stores";
import Documents from "../../resources";
import Constants from "../../constants";
import documentTestHelper from "../../tests/document-test-helper";
import utils from "../../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import TestUtils from "react-addons-test-utils";

FauxtonAPI.router = new FauxtonAPI.Router([]);

var assert = utils.assert;
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
      var $el = $(ReactDOM.findDOMNode(instance)).find('.no-results-screen');
      assert.equal($el.text(), 'No Documents Found');
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
      var $el = $(ReactDOM.findDOMNode(instance)).find('.no-results-screen');
      assert.equal($el.text(), 'I <3 Hamburg');
    });
  });

  describe('checkbox rendering', function () {
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
        typeOfIndex: 'mango',
        bulkCollection: new Documents.BulkDeleteDocCollection([], {databaseId: '1'}),
      });

      store.toggleLayout({layout: Constants.LAYOUT_ORIENTATION.TABLE});

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
        typeOfIndex: 'mango',
        bulkCollection: new Documents.BulkDeleteDocCollection([], {databaseId: '1'}),
      });

      store.toggleLayout({layout: Constants.LAYOUT_ORIENTATION.TABLE});

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
        typeOfIndex: 'view',
        bulkCollection: new Documents.BulkDeleteDocCollection([], {databaseId: '1'}),
      });

      store.toggleLayout({layout: Constants.LAYOUT_ORIENTATION.TABLE});

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
        typeOfIndex: 'view',
        bulkCollection: new Documents.BulkDeleteDocCollection([], {databaseId: '1'}),
      });

      store.toggleLayout({layout: Constants.LAYOUT_ORIENTATION.TABLE});

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
        typeOfIndex: 'view',
        bulkCollection: new Documents.BulkDeleteDocCollection([], {databaseId: '1'}),
      });

      store.toggleLayout({layout: Constants.LAYOUT_ORIENTATION.TABLE});

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
        typeOfIndex: 'view',
        bulkCollection: new Documents.BulkDeleteDocCollection([], {databaseId: '1'}),
      });

      IndexResultsActions.resultsListReset();

      store.toggleLayout({layout: Constants.LAYOUT_ORIENTATION.JSON});

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
        typeOfIndex: 'view',
        bulkCollection: new Documents.BulkDeleteDocCollection([], {databaseId: '1'}),
      });

      IndexResultsActions.resultsListReset();

      store.toggleLayout({layout: Constants.LAYOUT_ORIENTATION.JSON});

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
        typeOfIndex: 'view',
        bulkCollection: new Documents.BulkDeleteDocCollection([], {databaseId: '1'}),
      });

      store.toggleLayout({layout: Constants.LAYOUT_ORIENTATION.TABLE});

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
      var results = {results: [], selectedFields: []};
      instance = TestUtils.renderIntoDocument(
        <Views.ResultsScreen results={results} isLoading={true} />,
        container
      );

      var $el = $(ReactDOM.findDOMNode(instance));

      assert.ok($el.find('.loading-lines').length === 1);
    });

    it('should not show loading component', function () {
      var results = {results: [], selectedFields: []};
      instance = TestUtils.renderIntoDocument(
        <Views.ResultsScreen results={results} isLoading={false} />,
        container
      );

      var $el = $(ReactDOM.findDOMNode(instance));

      assert.ok($el.find('.loading-lines').length === 0);
    });
  });

});
