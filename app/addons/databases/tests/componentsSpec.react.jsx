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
  'addons/databases/components.react',
  'addons/databases/actions',
  'addons/databases/actiontypes',
  'addons/databases/stores',
  'testUtils',
  "react",
  'react-dom'
], function (FauxtonAPI, Views, Actions, ActionTypes, Stores, utils, React, ReactDOM) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;

  describe('DatabasesController', function () {

    var container, dbEl, oldGetCollection;

    beforeEach(function () {
      // define our own collection
      oldGetCollection = Stores.databasesStore.getCollection;
      Stores.databasesStore.getCollection = function () {
        return [
          {
            "get": function (what) {
              if ("name" === what) {
                return "db1";
              } else {
                throw "Unknown get('" + what + "')";
              }
            },
            "status": {
              "loadSuccess": true,
              "dataSize": function () {
                return 2 * 1024 * 1024;
              },
              "numDocs": function () {
                return 88;
              },
              "isGraveYard": function () {
                return false;
              },
              "updateSeq": function () {
                return 99;
              }
            }
          },
          {
            "get": function (what) {
              if ("name" === what) {
                return "db2";
              } else {
                throw "Unknown get('" + what + "')";
              }
            },
            "status": {
              "loadSuccess": true,
              "dataSize": function () {
                return 1024;
              },
              "numDocs": function () {
                return 188;
              },
              "numDeletedDocs": function () {
                return 222;
              },
              "isGraveYard": function () {
                return true;
              },
              "updateSeq": function () {
                return 399;
              }
            }
          }
        ];
      };
      container = document.createElement('div');
      dbEl = ReactDOM.render(React.createElement(Views.DatabasesController, {}), container);
    });

    afterEach(function () {
      Stores.databasesStore.getCollection = oldGetCollection;
      ReactDOM.unmountComponentAtNode(container);
    });

    it('renders base data of DBs', function () {
      assert.equal(1 + 2, dbEl.getDOMNode().getElementsByTagName('tr').length);
      assert.equal("db1", dbEl.getDOMNode().getElementsByTagName('tr')[1].getElementsByTagName('td')[0].innerText.trim());
      assert.equal("2.0 MB", dbEl.getDOMNode().getElementsByTagName('tr')[1].getElementsByTagName('td')[1].innerText.trim());
      assert.equal("88", dbEl.getDOMNode().getElementsByTagName('tr')[1].getElementsByTagName('td')[2].innerText.trim());
      assert.equal(0, dbEl.getDOMNode().getElementsByTagName('tr')[1].getElementsByTagName('td')[2].getElementsByTagName("i").length);
      assert.equal(2, dbEl.getDOMNode().getElementsByTagName('tr')[1].getElementsByTagName('td')[4].getElementsByTagName("a").length);
      assert.equal("db2", dbEl.getDOMNode().getElementsByTagName('tr')[2].getElementsByTagName('td')[0].innerText.trim());
      assert.equal(1, dbEl.getDOMNode().getElementsByTagName('tr')[2].getElementsByTagName('td')[2].getElementsByTagName("i").length);
    });

  });

  describe('AddDatabaseWidget', function () {

    var container, addEl, oldCreateNewDatabase;
    var createCalled, passedDbName;

    beforeEach(function () {
      oldCreateNewDatabase = Actions.createNewDatabase;
      Actions.createNewDatabase = function (dbName) {
        createCalled = true;
        passedDbName = dbName;
      };
      container = document.createElement('div');
      addEl = ReactDOM.render(React.createElement(Views.AddDatabaseWidget, {}), container);
    });

    afterEach(function () {
      Actions.createNewDatabase = oldCreateNewDatabase;
      ReactDOM.unmountComponentAtNode(container);
    });

    it("Creates a database with given name", function () {
      createCalled = false;
      passedDbName = null;
      TestUtils.findRenderedDOMComponentWithTag(addEl, 'input').getDOMNode().value = "testdb";
      addEl.onAddDatabase();
      assert.equal(true, createCalled);
      assert.equal("testdb", passedDbName);
    });

  });

  describe('JumpToDatabaseWidget', function () {

    var container, jumpEl, oldJumpToDatabase, oldGetDatabaseNames, old$;
    var jumpCalled, passedDbName;

    beforeEach(function () {
      old$ = $;
      // simulate typeahead
      $ = function (selector) {
        var res = old$(selector);
        res.typeahead = function () {};
        return res;
      };
      oldJumpToDatabase = Actions.jumpToDatabase;
      Actions.jumpToDatabase = function (dbName) {
        jumpCalled = true;
        passedDbName = dbName;
      };
      oldGetDatabaseNames = Stores.databasesStore.getDatabaseNames;
      Stores.databasesStore.getDatabaseNames = function () {
        return ["db1", "db2"];
      };
      container = document.createElement('div');
      jumpEl = ReactDOM.render(React.createElement(Views.JumpToDatabaseWidget, {}), container);
    });

    afterEach(function () {
      $ = old$;
      Actions.jumpToDatabase = oldJumpToDatabase;
      Stores.databasesStore.getDatabaseNames = oldGetDatabaseNames;
      ReactDOM.unmountComponentAtNode(container);
    });

    it("Jumps to a database with given name", function () {
      jumpCalled = false;
      passedDbName = null;
      jumpEl.jumpToDb("db1");
      assert.equal(true, jumpCalled);
      assert.equal("db1", passedDbName);
    });

    it("jumps to an existing DB from input", function () {
      jumpCalled = false;
      passedDbName = null;
      TestUtils.findRenderedDOMComponentWithTag(jumpEl, 'input').getDOMNode().value = "db2";
      jumpEl.jumpToDb();
      assert.equal(true, jumpCalled);
      assert.equal("db2", passedDbName);
    });

    it('updates DB list if data is sent after initially mounted', function () {
      var newCollection = new Backbone.Collection();
      newCollection.add(new Backbone.Model({ name: 'new-db1' }));
      newCollection.add(new Backbone.Model({ name: 'new-db2' }));

      var spy = sinon.spy(jumpEl, 'componentDidUpdate');

      FauxtonAPI.dispatch({
        type: ActionTypes.DATABASES_INIT,
        options: {
          collection: newCollection.toJSON(),
          backboneCollection: newCollection,
          page: 1
        }
      });

      // because of the need to override typeahead, this just does a spy on the componentDidUpdate method to ensure
      // it gets called
      assert.ok(spy.calledOnce);

      // reset the store for future use
      Stores.databasesStore.reset();
    });
  });


  describe('DatabasePagination', function () {
    it('uses custom URL prefix on the navigation if passed through props', function () {
      var container = document.createElement('div');
      var pagination = TestUtils.renderIntoDocument(<Views.DatabasePagination linkPath="_custom_path" />, container);
      var links = $(ReactDOM.findDOMNode(pagination)).find('a');

      assert.equal(links.length, 3, 'pagination contains links');
      links.each(function () {
        assert.include(this.href, '_custom_path', 'link contains custom path');
      });

      ReactDOM.unmountComponentAtNode(container);
    });
  });

  describe('DatabaseTable', function () {
    var container;

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('adds multiple extra columns if extended', function () {
      var ColHeader1 = React.createClass({
        render: function () { return <th>EXTRA COL 1</th>; }
      });
      var ColHeader2 = React.createClass({
        render: function () { return <th>EXTRA COL 2</th>; }
      });
      var ColHeader3 = React.createClass({
        render: function () { return <th>EXTRA COL 3</th>; }
      });

      FauxtonAPI.registerExtension('DatabaseTable:head', ColHeader1);
      FauxtonAPI.registerExtension('DatabaseTable:head', ColHeader2);
      FauxtonAPI.registerExtension('DatabaseTable:head', ColHeader3);

      var table = TestUtils.renderIntoDocument(<Views.DatabaseTable loading={false} body={[]} />, container);
      var cols = $(ReactDOM.findDOMNode(table)).find('th');

      // (default # of rows is 5)
      assert.equal(cols.length, 8, 'extra columns show up');

      FauxtonAPI.unRegisterExtension('DatabaseTable:head');
    });

    it('adds multiple extra column in DatabaseRow if extended', function () {
      var Cell = React.createClass({
        render: function () { return <td>EXTRA CELL</td>; }
      });

      FauxtonAPI.registerExtension('DatabaseTable:databaseRow', Cell);

      var row = new Backbone.Model({ name: 'db name' });
      row.status = {
        loadSuccess: true,
        dataSize: function () { return 0; },
        numDocs: function () { return 0; },
        updateSeq: function () { return 0; },
        isGraveYard: function () { return false; }
      };

      var databaseRow = TestUtils.renderIntoDocument(<Views.DatabaseTable body={[row]} />, container);
      var links = $(ReactDOM.findDOMNode(databaseRow)).find('td');

      // (default # of rows is 5)
      assert.equal(links.length, 6, 'extra column shows up');

      FauxtonAPI.unRegisterExtension('DatabaseTable:databaseRow');

      Stores.databasesStore.reset();
    });

    it('shows error message if row marked as failed to load', function () {
      var row = new Backbone.Model({ name: 'db name' });
      row.status = {
        loadSuccess: false,
        dataSize: function () { return 0; },
        numDocs: function () { return 0; },
        updateSeq: function () { return 0; },
        isGraveYard: function () { return false; }
      };

      var databaseRow = TestUtils.renderIntoDocument(<Views.DatabaseTable body={[row]} />, container);
      assert.equal($(ReactDOM.findDOMNode(databaseRow)).find('.database-load-fail').length, 1);
    });

    it('shows no error if row marked as loaded', function () {
      var row = new Backbone.Model({ name: 'db name' });
      row.status = {
        loadSuccess: true,
        dataSize: function () { return 0; },
        numDocs: function () { return 0; },
        updateSeq: function () { return 0; },
        isGraveYard: function () { return false; }
      };

      var databaseRow = TestUtils.renderIntoDocument(<Views.DatabaseTable body={[row]} />, container);

      assert.equal($(ReactDOM.findDOMNode(databaseRow)).find('.database-load-fail').length, 0);
    });

  });

});

