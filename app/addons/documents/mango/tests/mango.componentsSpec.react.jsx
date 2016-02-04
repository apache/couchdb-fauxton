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
  '../../../../core/api',
  '../mango.components.react',
  '../mango.stores',
  '../mango.actions',
  '../mango.actiontypes',
  '../../resources',
  '../../../databases/resources',
  '../../../../../test/mocha/testUtils',
  'react',
  'react-dom',
  'react-addons-test-utils',
  'sinon'
], function (FauxtonAPI, Views, Stores, MangoActions, ActionTypes, Resources, Databases, utils, React, ReactDOM, TestUtils, sinon) {

  var assert = utils.assert;

  describe('Mango IndexEditor', function () {
    var database = new Databases.Model({id: 'testdb'}),
        container,
        editor;

    beforeEach(function () {
      container = document.createElement('div');
      MangoActions.setDatabase({
        database: database
      });
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('renders a default index definition', function () {
      editor = TestUtils.renderIntoDocument(
        <Views.MangoIndexEditorController description="foo" />,
        container
      );

      var payload = JSON.parse(editor.getMangoEditor().getEditorValue());
      assert.equal(payload.index.fields[0], '_id');
    });

    it('renders the current database', function () {
      editor = TestUtils.renderIntoDocument(
        <Views.MangoIndexEditorController description="foo" />,
        container
      );
      var $el = $(ReactDOM.findDOMNode(editor));

      assert.equal($el.find('.db-title').text(), 'testdb');
    });

    it('renders a description', function () {
      editor = TestUtils.renderIntoDocument(
        <Views.MangoIndexEditorController description="CouchDB Query is great!" />,
        container
      );
      var $el = $(ReactDOM.findDOMNode(editor));

      assert.equal($el.find('.editor-description').text(), 'CouchDB Query is great!');
    });
  });

  describe('Mango QueryEditor', function () {
    var database = new Databases.Model({id: 'testdb'}),
        container,
        editor,
        mangoCollection;

    beforeEach(function () {
      container = document.createElement('div');
      MangoActions.setDatabase({
        database: database
      });

      MangoActions.mangoResetIndexList({isLoading: false});

      mangoCollection = new Resources.MangoIndexCollection([{
        ddoc: '_design/e4d338e5d6f047749f5399ab998b4fa04ba0c816',
        def: {
          fields: [
            {'_id': 'asc'},
            {'foo': 'bar'},
            {'ente': 'gans'}
          ]
        },
        name: 'e4d338e5d6f047749f5399ab998b4fa04ba0c816',
        type: 'json'
      }, {
        ddoc: null,
        def: {
          fields: [{
            '_id': 'asc'
          }]
        },
        name: '_all_docs',
        type: 'special'
      }], {
        params: {},
        database: {
          safeID: function () { return '1'; }
        }
      });

      FauxtonAPI.dispatch({
        type: ActionTypes.MANGO_NEW_AVAILABLE_INDEXES,
        options: {indexList: mangoCollection}
      });

    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('lists our available indexes', function () {
      editor = TestUtils.renderIntoDocument(
        <Views.MangoQueryEditorController description="foo" />,
        container
      );
      var $el = $(ReactDOM.findDOMNode(editor));
      assert.equal($el.find('.mango-available-indexes').length, 1);

      assert.include(
        $el.find('.mango-available-indexes').text(),
        'json: _id, foo, ente'
      );
      assert.include(
        $el.find('.mango-available-indexes').text(),
        'json: _id'
      );
    });

    it('has a default query', function () {
      editor = ReactDOM.render(
        <Views.MangoQueryEditorController description="foo" />,
        container
      );
      var json = JSON.parse(editor.getMangoEditor().getEditorValue());
      assert.equal(Object.keys(json.selector)[0], '_id');
    });

    it('can render a query based on the last defined index', function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.MANGO_NEW_QUERY_FIND_CODE_FROM_FIELDS,
        options: {
          fields: ['zetti', 'mussmaennchen']
        }
      });

      editor = TestUtils.renderIntoDocument(
        <Views.MangoQueryEditorController description="foo" />,
        container
      );

      var json = JSON.parse(editor.getMangoEditor().getEditorValue());
      assert.equal(Object.keys(json.selector)[0], 'zetti');
      assert.equal(Object.keys(json.selector)[1], 'mussmaennchen');
    });

    it('informs the user that it uses a query based on the last defined index', function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.MANGO_NEW_QUERY_FIND_CODE_FROM_FIELDS,
        options: {
          fields: ['zetti', 'mussmaennchen']
        }
      });

      editor = TestUtils.renderIntoDocument(
        <Views.MangoQueryEditorController description="foo" />,
        container
      );
      var $el = $(ReactDOM.findDOMNode(editor));
      assert.equal($el.find('.info-changed-query').length, 1);
    });

    it('renders the current database', function () {
      editor = TestUtils.renderIntoDocument(
        <Views.MangoQueryEditorController description="foo" />,
        container
      );
      var $el = $(ReactDOM.findDOMNode(editor));

      assert.equal($el.find('.db-title').text(), 'testdb');
    });

    it('renders a description', function () {
      editor = TestUtils.renderIntoDocument(
        <Views.MangoQueryEditorController description="CouchDB Query is great!" />,
        container
      );
      var $el = $(ReactDOM.findDOMNode(editor));

      assert.equal($el.find('.editor-description').text(), 'CouchDB Query is great!');
    });
  });
});
