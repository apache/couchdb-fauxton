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

import app from "../../../app";
import FauxtonAPI from "../../../core/api";
import utils from "../../../../test/mocha/testUtils";
import Stores from "../stores";
import ActionTypes from "../actiontypes";
import Resources from "../resources";

var assert = utils.assert;

describe('Databases Store', function () {

  var oldColl, oldBackbone;
  var passedId, doneCallback, errorCallback, navigationTarget;

  beforeEach(function () {
    oldColl = Stores.databasesStore._collection;
    oldBackbone = Stores.databasesStore._backboneCollection;
    Stores.databasesStore._backboneCollection = {};
  });

  afterEach(function () {
    Stores.databasesStore._collection = oldColl;
    Stores.databasesStore._backboneCollection = oldBackbone;
  });

  it("inits based on what we pass", function () {
    Stores.databasesStore.init({"name": "col1"}, {"name": "col2"});
    assert.equal("col1", Stores.databasesStore.getCollection().name);
    assert.equal("col2", Stores.databasesStore._backboneCollection.name);
  });

  describe("database collection info", function () {

    beforeEach(() => {
      const data = [{"name": "db1"}, {"name": "db2"}];

      const collection = new Backbone.Collection();
      collection.add(data);

      Stores.databasesStore._backboneCollection = collection;
    });

    it("determines database names", function () {
      assert.ok(JSON.stringify(["db1", "db2"]) === JSON.stringify(Stores.databasesStore.getDatabaseNames().sort()));
    });

    it("determines database availability", function () {
      assert(Stores.databasesStore.doesDatabaseExist("db1"));
      assert(!Stores.databasesStore.doesDatabaseExist("db3"));
    });

  });

});
