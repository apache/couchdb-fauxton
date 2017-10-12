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
import FauxtonAPI from "../../../core/api";
import Views from "../components";
import Actions from "../actions";
import Stores from "../stores";
import utils from "../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import { mount } from 'enzyme';

const assert = utils.assert;

const store = Stores.databasesStore;

describe('AddDatabaseWidget', () => {
  let oldCreateNewDatabase;
  let createCalled, passedDbName;

  beforeEach(() => {
    oldCreateNewDatabase = Actions.createNewDatabase;
    Actions.createNewDatabase = function (dbName) {
      createCalled = true;
      passedDbName = dbName;
    };
  });

  afterEach(() => {
    Actions.createNewDatabase = oldCreateNewDatabase;
  });

  it("Creates a database with given name", () => {
    createCalled = false;
    passedDbName = null;
    const el = mount(<Views.AddDatabaseWidget />);
    el.setState({databaseName: 'my-db'});
    el.instance().onAddDatabase();
    assert.equal(true, createCalled);
    assert.equal("my-db", passedDbName);
  });

});


describe('DatabasePagination', () => {

  beforeEach(() => {
    store.reset();
  });

  it('uses custom URL prefix on the navigation if passed through props', () => {
    const pagination = mount(<Views.DatabasePagination linkPath="_custom_path" />);
    const links = pagination.find('a');

    assert.equal(links.length, 3, 'pagination contains links');
    links.forEach(link => {
      assert.include(link.props('href').href, '_custom_path', 'link contains custom path');
    });
  });

  it('renders the database count and range', () => {
    const controller = mount(<Views.DatabasePagination linkPath="_custom_path" />);
    const dbList = [];

    for (let i = 0; i < 30; i++) {
      dbList.push(`db-${i}`);
    }

    Actions.updateDatabases({
      dbList: dbList.slice(0, 10),
      databaseDetails: [],
      failedDbs: [],
      fullDbList: dbList
    });

    assert.equal(controller.find('.all-db-footer__range').text(), '1–20');
    assert.equal(controller.find('.all-db-footer__total-db-count').text(), '30');
  });

});

describe('DatabaseTable', () => {
  beforeEach(() => {
    Actions.updateDatabases({
      dbList: ['db1'],
      databaseDetails: [{db_name: 'db1', doc_count: 0, doc_del_count: 0}],
      failedDbs: ['db1'],
      fullDbList: ['db1']
    });
  });

  it('adds multiple extra columns if extended', () => {
    class ColHeader1 extends React.Component {
      render() { return <th>EXTRA COL 1</th>; }
    }

    class ColHeader2 extends React.Component {
      render() { return <th>EXTRA COL 2</th>; }
    }

    class ColHeader3 extends React.Component {
      render() { return <th>EXTRA COL 3</th>; }
    }

    FauxtonAPI.registerExtension('DatabaseTable:head', ColHeader1);
    FauxtonAPI.registerExtension('DatabaseTable:head', ColHeader2);
    FauxtonAPI.registerExtension('DatabaseTable:head', ColHeader3);

    var table = mount(
      <Views.DatabaseTable showDeleteDatabaseModal={{showModal: false}} loading={false} dbList={[]} />
    );
    var cols = table.find('th');

    // (default # of rows is 4)
    assert.equal(cols.length, 7, 'extra columns show up');

    FauxtonAPI.unRegisterExtension('DatabaseTable:head');
  });

  it('adds multiple extra column in DatabaseRow if extended', () => {
    class Cell extends React.Component {
      render() { return <td>EXTRA CELL</td>; }
    }

    FauxtonAPI.registerExtension('DatabaseTable:databaseRow', Cell);

    Actions.updateDatabases({
      dbList: ['db1'],
      databaseDetails: [{db_name: 'db1', doc_count: 0, doc_del_count: 0}],
      failedDbs: [],
      fullDbList: ['db1']
    });

    const list = store.getDbList();

    var databaseRow = mount(
      <Views.DatabaseTable showDeleteDatabaseModal={{showModal: false}} dbList={list} loading={false}/>
    );
    var links = databaseRow.find('td');

    // (default # of rows is 4)
    assert.equal(links.length, 5, 'extra column shows up');

    FauxtonAPI.unRegisterExtension('DatabaseTable:databaseRow');

    Stores.databasesStore.reset();
  });

  it('shows error message if row marked as failed to load', () => {
    Actions.updateDatabases({
      dbList: ['db1'],
      databaseDetails: [{db_name: 'db1', doc_count: 0, doc_del_count: 0}],
      failedDbs: ['db1'],
      fullDbList: ['db1']
    });

    const list = store.getDbList();

    var databaseRow = mount(
      <Views.DatabaseTable showDeleteDatabaseModal={{showModal: false}} dbList={list} loading={false} />
    );
    assert.equal(databaseRow.find('.database-load-fail').length, 1);
  });

  it('shows no error if row marked as loaded', () => {
    Actions.updateDatabases({
      dbList: ['db1'],
      databaseDetails: [{db_name: 'db1', doc_count: 0, doc_del_count: 0}],
      failedDbs: [],
      fullDbList: ['db1']
    });

    const list = store.getDbList();

    var databaseRow = mount(
      <Views.DatabaseTable showDeleteDatabaseModal={{showModal: false}} dbList={list} loading={false} />
    );

    assert.equal(databaseRow.find('.database-load-fail').length, 0);
  });
});
