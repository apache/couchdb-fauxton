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

import Stores from "../stores";
import "../../documents/base";

import DatabaseActions from "../actions";

const store = Stores.databasesStore;
describe('Databases Store', function () {

  describe('database list storage', function () {

    beforeEach(() => {
      store.reset();
    });

    it('marks failed detail fetches as failed dbs', () => {
      DatabaseActions.updateDatabases({
        dbList: ['db1', 'db2'],
        databaseDetails: [{db_name: 'db1', sizes: {}}, {db_name: 'db2', sizes: {}}],
        failedDbs: ['db1']
      });

      const list = store.getDbList();

      expect(list[0].failed).toBeTruthy();
    });

    it('unions details', () => {
      DatabaseActions.updateDatabases({
        dbList: ['db1'],
        databaseDetails: [{db_name: 'db1', doc_count: 5, doc_del_count: 3, sizes: {}}],
        failedDbs: []
      });

      const list = store.getDbList();

      expect(list[0].docCount).toBe(5);
      expect(list[0].docDelCount).toBe(3);
    });

    it('determines database availability', () => {
      DatabaseActions.updateDatabases({
        dbList: ['db1', 'db2'],
        databaseDetails: [],
        failedDbs: []
      });

      expect(store.doesDatabaseExist('db1')).toBeTruthy();
      expect(!store.doesDatabaseExist('db3')).toBeTruthy();
    });

    it('uses the sizes.active prop', () => {
      DatabaseActions.updateDatabases({
        dbList: ['db1'],
        databaseDetails: [{
          db_name: 'db1',
          doc_count: 5,
          doc_del_count: 3,
          sizes: {
            active: 1337,
            external: 0,
            file: 0,
          }
        }],
        failedDbs: []
      });

      const dbList = store.getDbList();

      expect(dbList[0].dataSize).toBe('1.3 KB');
    });

  });

});
