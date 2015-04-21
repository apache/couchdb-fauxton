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
  'addons/documents/mango/mango.components.react',
  'addons/documents/mango/mango.stores',
  'addons/documents/mango/mango.actions',

  'addons/documents/resources',
  'addons/databases/resources',

  'testUtils',
  'react'
], function (FauxtonAPI, Views, Stores, MangoActions, Resources, Databases, utils, React) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;
  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var fakeData = [
      {
        ddoc: '_design/e4d338e5d6f047749f5399ab998b4fa04ba0c816',
        def: {
          fields: [{
            '_id': 'asc'
          }]
        },
        name: 'e4d338e5d6f047749f5399ab998b4fa04ba0c816',
        type: 'json'
      },
      {
        ddoc: null,
        def: {
          fields: [{
            '_id': 'asc'
          }]
        },
        name: '_all_docs',
        type: 'special'
      }
    ];


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
      React.unmountComponentAtNode(container);
    });

    it('renders a default index definition', function () {
      editor = TestUtils.renderIntoDocument(<Views.MangoIndexEditorController description="foo" />, container);
      var $el = $(editor.getDOMNode());
      var payload = JSON.parse(editor.refs.indexQueryEditor.getValue());
      assert.equal(payload.index.fields[0], '_id');
    });

    it('renders the current database', function () {
      editor = TestUtils.renderIntoDocument(<Views.MangoIndexEditorController description="foo" />, container);
      var $el = $(editor.getDOMNode());

      assert.equal($el.find('.db-title').text(), 'testdb');
    });

    it('renders a description', function () {
      editor = TestUtils.renderIntoDocument(<Views.MangoIndexEditorController description="CouchDB Query is great!" />, container);
      var $el = $(editor.getDOMNode());

      assert.equal($el.find('.editor-description').text(), 'CouchDB Query is great!');
    });
  });

});
