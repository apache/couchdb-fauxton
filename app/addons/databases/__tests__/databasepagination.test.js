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
import React from 'react';
import ReactDOM from 'react-dom';
import "../../documents/base";
import DatabaseActions from "../actions";
import {mount} from 'enzyme';
import DatabaseComponents from "../components";

const store = Stores.databasesStore;

describe('Database Pagination', function () {

  it('renders correct pagination upon store change', () => {
    DatabaseActions.updateDatabases({
      dbList: ['db1'],
      databaseDetails: [{db_name: 'db1', doc_count: 0, doc_del_count: 0}],
      failedDbs: [],
      fullDbList: ['db1']
    });

    const tempStore = {
      getTotalAmountOfDatabases: () => { return 10; },
      getPage: () => { return 1; },
      getLimit: () => { return 20; },
      on: () => {},
      off: () => {}
    };

    const pagination = mount(<DatabaseComponents.DatabasePagination store={tempStore} />);
    expect(pagination.find('.all-db-footer__total-db-count').text()).toMatch('10');

    // switch stores
    pagination.setProps({store: store});
    expect(pagination.find('.all-db-footer__total-db-count').text()).toMatch('1');
  });

});
