
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
import Actions from "../actions";
import Stores from "../stores";
import utils from "../../../../test/mocha/testUtils";
import React from "react";
import { mount } from 'enzyme';
import sinon from 'sinon';
import Views from "../components";

const store = Stores.databasesStore;

describe('AddDatabaseWidget', () => {

  beforeEach(() => {
    sinon.stub(Actions, 'createNewDatabase');
  });

  afterEach(() => {
    Actions.createNewDatabase.restore();
  });

  it("creates a database with given name", () => {
    const el = mount(<Views.AddDatabaseWidget />);
    el.setState({databaseName: 'my-db'});
    el.instance().onAddDatabase();
    sinon.assert.calledWith(Actions.createNewDatabase, 'my-db');
  });

  it('creates a non-partitioned database', () => {
    const el = mount(<Views.AddDatabaseWidget showPartitionedOption={true}/>);
    el.setState({databaseName: 'my-db', partitionedSelected: false});
    el.instance().onAddDatabase();
    sinon.assert.calledWith(Actions.createNewDatabase, 'my-db', false);
  });

  it('creates a partitioned database', () => {
    const el = mount(<Views.AddDatabaseWidget showPartitionedOption={true}/>);
    el.setState({databaseName: 'my-db', partitionedSelected: true});
    el.instance().onAddDatabase();
    sinon.assert.calledWith(Actions.createNewDatabase, 'my-db', true);
  });
});


describe('DatabasePagination', () => {

  beforeEach(() => {
    store.reset();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('uses custom URL prefix on the navigation if passed through props', () => {
    const mockNavigate = sinon.stub(FauxtonAPI, 'navigate');
    const pagination = mount(<Views.DatabasePagination linkPath="_custom_path" />);
    const links = pagination.find('a');

    expect(links.length).toBe(3);
    links.forEach(link => {
      link.simulate('click', { preventDefault: () => {}});
      sinon.assert.calledWithMatch(mockNavigate, '_custom_path');
      mockNavigate.reset();
    });
  });

  it('sets the correct page and perPage values', () => {
    const mockNavigate = sinon.stub(FauxtonAPI, 'navigate');
    store._fullDbList = ['db1', 'db2', 'db3', 'db4'];
    store._page = 2;
    store._limit = 2;
    const pagination = mount(<Views.DatabasePagination />);
    const links = pagination.find('a');
    // "<<" link
    links.at(0).simulate('click', { preventDefault: () => {}});
    sinon.assert.calledWithMatch(mockNavigate, 'page=1&limit=2');
    mockNavigate.reset();

    // page "2" link
    links.at(2).simulate('click', { preventDefault: () => {}});
    sinon.assert.calledWithMatch(mockNavigate, 'page=2&limit=2');
    mockNavigate.reset();

    // ">>" link
    links.at(3).simulate('click', { preventDefault: () => {}});
    sinon.assert.calledWithMatch(mockNavigate, 'page=2&limit=2');
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

    expect(controller.find('.all-db-footer__range').text()).toBe('1–20');
    expect(controller.find('.all-db-footer__total-db-count').text()).toBe('30');
  });

});

describe('DatabaseTable', () => {
  beforeEach(() => {
    Actions.updateDatabases({
      dbList: ['db1'],
      databaseDetails: [{db_name: 'db1', doc_count: 0, doc_del_count: 0, sizes: {}}],
      failedDbs: ['db1'],
      fullDbList: ['db1']
    });
    // To avoid console.error() in app/core/api.js
    sinon.stub(FauxtonAPI, 'urls').returns('/fake/url');
  });

  afterEach(() => {
    utils.restore(FauxtonAPI.urls);
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
      <Views.DatabaseTable showDeleteDatabaseModal={{showModal: false}} loading={false} dbList={[]} showPartitionedColumn={false}/>
    );
    var cols = table.find('th');

    // (default # of rows is 4)
    expect(cols.length).toBe(7);

    FauxtonAPI.unRegisterExtension('DatabaseTable:head');
  });

  it('adds multiple extra column in DatabaseRow if extended', () => {
    class Cell extends React.Component {
      render() { return <td>EXTRA CELL</td>; }
    }

    FauxtonAPI.registerExtension('DatabaseTable:databaseRow', Cell);

    Actions.updateDatabases({
      dbList: ['db1'],
      databaseDetails: [{db_name: 'db1', doc_count: 0, doc_del_count: 0, sizes: {}}],
      failedDbs: [],
      fullDbList: ['db1']
    });

    const list = store.getDbList();

    var databaseRow = mount(
      <Views.DatabaseTable showDeleteDatabaseModal={{showModal: false}} dbList={list} loading={false} showPartitionedColumn={false}/>
    );
    var links = databaseRow.find('td');

    // (default # of rows is 4)
    expect(links.length).toBe(5);

    FauxtonAPI.unRegisterExtension('DatabaseTable:databaseRow');

    Stores.databasesStore.reset();
  });

  it('shows error message if row marked as failed to load', () => {
    Actions.updateDatabases({
      dbList: ['db1'],
      databaseDetails: [{db_name: 'db1', doc_count: 0, doc_del_count: 0, sizes: {}}],
      failedDbs: ['db1'],
      fullDbList: ['db1']
    });

    const list = store.getDbList();

    var databaseRow = mount(
      <Views.DatabaseTable showDeleteDatabaseModal={{showModal: false}} dbList={list} loading={false} showPartitionedColumn={false}/>
    );
    expect(databaseRow.find('.database-load-fail').length).toBe(1);
  });

  it('shows no error if row marked as loaded', () => {
    Actions.updateDatabases({
      dbList: ['db1'],
      databaseDetails: [{db_name: 'db1', doc_count: 0, doc_del_count: 0, sizes: {}}],
      failedDbs: [],
      fullDbList: ['db1']
    });

    const list = store.getDbList();

    var databaseRow = mount(
      <Views.DatabaseTable showDeleteDatabaseModal={{showModal: false}} dbList={list} loading={false} showPartitionedColumn={false}/>
    );

    expect(databaseRow.find('.database-load-fail').length).toBe(0);
  });

  it('shows Partitioned column only when prop is set to true', () => {
    Actions.updateDatabases({
      dbList: ['db1'],
      databaseDetails: [{db_name: 'db1', doc_count: 0, doc_del_count: 0, sizes:{}, props: {partitioned: true}}],
      failedDbs: [],
      fullDbList: ['db1']
    });

    const list = store.getDbList();

    const withPartColumn = mount(
      <Views.DatabaseTable showDeleteDatabaseModal={{showModal: false}} dbList={list} loading={false} showPartitionedColumn={true}/>
    );
    const colHeaders = withPartColumn.find('th');
    expect(colHeaders.length).toBe(5);
    expect(colHeaders.get(3).props.children).toBe('Partitioned');

    const withoutPartColumn = mount(
      <Views.DatabaseTable showDeleteDatabaseModal={{showModal: false}} dbList={list} loading={false} showPartitionedColumn={false}/>
    );
    expect(withoutPartColumn.find('th').length).toBe(4);
  });

  it('shows correct values in the Partitioned column', () => {
    Actions.updateDatabases({
      dbList: ['db1', 'db2'],
      databaseDetails: [
        {db_name: 'db1', doc_count: 1, doc_del_count: 0, sizes: {}, props: {partitioned: true}},
        {db_name: 'db2', doc_count: 2, doc_del_count: 0, sizes: {}, props: {partitioned: false}}
      ],
      failedDbs: [],
      fullDbList: ['db1', 'db2']
    });

    const list = store.getDbList();

    const dbTable = mount(
      <Views.DatabaseTable showDeleteDatabaseModal={{showModal: false}} dbList={list} loading={false} showPartitionedColumn={true}/>
    );
    const colCells = dbTable.find('td');
    // 2 rows with 5 cells each
    expect(colCells.length).toBe(10);
    expect(colCells.get(3).props.children).toBe('Yes');
    expect(colCells.get(8).props.children).toBe('No');
  });
});
