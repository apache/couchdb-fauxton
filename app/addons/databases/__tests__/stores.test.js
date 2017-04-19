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

import utils from "../../../../test/mocha/testUtils";
import Stores from "../stores";
import "../../documents/base";

import DatabaseActions from "../actions";

const assert = utils.assert;

const store = Stores.databasesStore;
describe('Databases Store', function () {

  describe('database list storage', function () {

    beforeEach(() => {
      store.reset();
    });

    it('marks failed detail fetches as failed dbs', () => {
      DatabaseActions.updateDatabases({
        dbList: ['db1', 'db2'],
        databaseDetails: [{db_name: 'db1'}, {db_name: 'db2'}],
        failedDbs: ['db1']
      });

      const list = store.getDbList();

      assert.ok(list[0].failed);
    });

    it('unions details', () => {
      DatabaseActions.updateDatabases({
        dbList: ['db1'],
        databaseDetails: [{db_name: 'db1', doc_count: 5, doc_del_count: 3}],
        failedDbs: []
      });

      const list = store.getDbList();

      assert.equal(list[0].docCount, 5);
      assert.equal(list[0].docDelCount, 3);
    });

    it('determines database availability', () => {
      DatabaseActions.updateDatabases({
        dbList: ['db1', 'db2'],
        databaseDetails: [],
        failedDbs: []
      });

      assert(store.doesDatabaseExist('db1'));
      assert(!store.doesDatabaseExist('db3'));
    });

    it('uses the data_size prop', () => {
      DatabaseActions.updateDatabases({
        dbList: ['db1'],
        databaseDetails: [{
          db_name: 'db1',
          doc_count: 5,
          doc_del_count: 3,
          data_size: 1337,
          disk_size: 0
        }],
        failedDbs: []
      });

      const dbList = store.getDbList();

      assert.equal(dbList[0].dataSize, '1.3 KB');
    });

  });

});
