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
  'testUtils',
  'addons/databases/stores',
  'addons/databases/actions',
  'addons/databases/actiontypes',
  'addons/databases/resources'
], function (app, FauxtonAPI, utils, Stores, Actions, ActionTypes, Resources) {

  var assert = utils.assert;

  describe('Databases Actions', function () {

    describe('Initialization', function () {

      var oldDispatch, oldWhen, oldGetParams;
      var dispatchEvents, thenCallback, alwaysCallback;
      var databasesMock;

      beforeEach(function () {
        oldDispatch = FauxtonAPI.dispatch;
        dispatchEvents = [];
        FauxtonAPI.dispatch = function (what) {
          dispatchEvents.push(what);
        };
        oldWhen = FauxtonAPI.when;
        FauxtonAPI.when = function () {
          return {
            then: function (callback) {
              thenCallback = callback;
              callback();
            },
            always: function (callback) {
              alwaysCallback = callback;
              callback();
            }
          };
        };
        // (replace on demand)
        oldGetParams = app.getParams;
        databasesMock = {
          fetch: function () {
          },
          paginated: function () {
            return [];
          }
        };
      });

      afterEach(function () {
        FauxtonAPI.dispatch = oldDispatch;
        FauxtonAPI.when = oldWhen;
        app.getParams = oldGetParams;
      });

      it('Starts loading first', function () {
        app.getParams = function () {
          return {};
        };
        Actions.init(databasesMock);
        assert(!!thenCallback || !!alwaysCallback);
        // now we should have resolved it all
        assert.equal(2, dispatchEvents.length);
        assert.equal(ActionTypes.DATABASES_STARTLOADING, dispatchEvents[0].type);
        assert.equal(ActionTypes.DATABASES_INIT, dispatchEvents[1].type);
        assert.equal(1, dispatchEvents[1].options.page);
      });

      it('Accepts page params', function () {
        app.getParams = function () {
          return {
            page: 33
          };
        };
        Actions.init(databasesMock);
        // now we should have resolved it all
        assert.equal(2, dispatchEvents.length);
        assert.equal(ActionTypes.DATABASES_INIT, dispatchEvents[1].type);
        assert.equal(33, dispatchEvents[1].options.page);
      });

    });

    describe('Add database', function () {

      var oldColl, oldBackbone, oldRouter, oldNotification, oldDispatch;
      var passedId, doneCallback, errorCallback, navigationTarget, notificationText, dispatchEvents;

      beforeEach(function () {
        oldColl = Stores.databasesStore._collection;
        oldBackbone = Stores.databasesStore._backboneCollection;
        passedId = null;
        Stores.databasesStore._backboneCollection = {};
        Stores.databasesStore._backboneCollection.model = function (options) {
          passedId = options.id;
          return {
            "save": function () {
              var res = {
                "done": function (callback) {
                  doneCallback = callback;
                  return res;
                },
                "error": function (callback) {
                  errorCallback = callback;
                  return res;
                }
              };
              return res;
            }
          };
        };
        oldRouter = app.router;
        navigationTarget = null;
        app.router = {
          "navigate": function (target) {
            navigationTarget = target;
          }
        };
        oldNotification = FauxtonAPI.addNotification;
        notificationText = [];
        FauxtonAPI.addNotification = function (options) {
          notificationText.push(options.msg);
        };
        oldDispatch = FauxtonAPI.dispatch;
        dispatchEvents = [];
        FauxtonAPI.dispatch = function (what) {
          dispatchEvents.push(what);
        };
      });

      afterEach(function () {
        Stores.databasesStore._collection = oldColl;
        Stores.databasesStore._backboneCollection = oldBackbone;
        app.router = oldRouter;
        FauxtonAPI.addNotification = oldNotification;
        FauxtonAPI.dispatch = oldDispatch;
      });

      it("Creates database in backend", function () {
        Actions.createNewDatabase("testdb");
        doneCallback();
        assert.equal("testdb", passedId);
        assert.equal(1, _.map(dispatchEvents, function (item) {
          if (item.type === ActionTypes.DATABASES_SET_PROMPT_VISIBLE) {
            return item;
          }
        }).length);
        assert.equal(2, notificationText.length);
        assert(notificationText[0].indexOf("Creating") >= 0);
        assert(notificationText[1].indexOf("success") >= 0);
        assert(navigationTarget.indexOf("testdb") >= 0);
      });

      it("Creates no database without name", function () {
        Actions.createNewDatabase("   ");
        assert(passedId === null);
        assert.equal(0, _.map(dispatchEvents, function (item) {
          if (item.type === ActionTypes.DATABASES_SET_PROMPT_VISIBLE) {
            return item;
          }
        }).length);
        assert.equal(1, notificationText.length);
        assert(notificationText[0].indexOf("valid database name") >= 0);
      });

      it("Shows error message on create fail", function () {
        Actions.createNewDatabase("testdb");
        errorCallback({"responseText": JSON.stringify({"reason": "testerror"})});
        assert.equal("testdb", passedId);
        assert.equal(2, notificationText.length);
        assert(notificationText[0].indexOf("Creating") >= 0);
        assert(notificationText[1].indexOf("failed") >= 0);
        assert(notificationText[1].indexOf("testerror") >= 0);
        assert(navigationTarget === null);
      });

    });

    describe('Jump to database', function () {

      var container, jumpEl, oldNavigate, oldAddNotification, oldGetDatabaseNames, old$;
      var navigationTarget, notificationText;

      beforeEach(function () {
        old$ = $;
        // simulate typeahead
        $ = function (selector) {
          var res = old$(selector);
          res.typeahead = function () {};
          return res;
        };
        oldNavigate = FauxtonAPI.navigate;
        navigationTarget = null;
        FauxtonAPI.navigate = function (url) {
          navigationTarget = url;
        };
        oldAddNotification = FauxtonAPI.addNotification;
        notificationText = [];
        FauxtonAPI.addNotification = function (options) {
          notificationText.push(options.msg);
        };
        oldGetDatabaseNames = Stores.databasesStore.getDatabaseNames;
        Stores.databasesStore.getDatabaseNames = function () {
          return ["db1", "db2"];
        };
      });

      afterEach(function () {
        $ = old$;
        FauxtonAPI.navigate = oldNavigate;
        FauxtonAPI.addNotification = oldAddNotification;
        Stores.databasesStore.getDatabaseNames = oldGetDatabaseNames;
      });

      it("jumps to an existing DB", function () {
        Actions.jumpToDatabase("db1");
        assert(navigationTarget.indexOf("db1") >= 0);
        assert.equal(0, notificationText.length);
      });

      it("does nothing on empty name", function () {
        Actions.jumpToDatabase("  ");
        assert(navigationTarget === null);
        assert.equal(0, notificationText.length);
      });

      it("shows a message on non-existent DB", function () {
        Actions.jumpToDatabase("db3");
        assert(navigationTarget === null);
        assert.equal(1, notificationText.length);
        assert(notificationText[0].indexOf("not exist") >= 0);
      });

    });

    describe('isValidDatabaseName', function () {
      it("accepts valid database names", function () {
        [
          "one",
          "one$",
          "one/",
          "o-n-e",
          "o_n_e",
          "o+n+e",
          "one(or-two)"
        ].forEach(function (item) {
          assert.equal(Actions.isValidDatabaseName(item), true);
        });
      });

      it("rejects invalid database names", function () {
        [
          "ONE",
          "_one",
          "-blah",
          "one%",
          "one*",
          "one@",
          "one#",
          "one^",
          "one~",
          "one two",
          " one"
        ].forEach(function (item) {
          assert.equal(Actions.isValidDatabaseName(item), false, "item: " + item);
        });
      });
    });

  });

});
