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

import { mount, shallow } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import FauxtonAPI from '../../../../core/api';
import utils from '../../../../../test/mocha/testUtils';
import databasesReducer from '../../../databases/reducers';
import indexResultsReducer from '../../index-results/reducers';
import Views from '../mango.components';
import MangoQueryEditor from '../components/MangoQueryEditor';
import MangoIndexEditor from '../components/MangoIndexEditor';
import mangoReducer from '../mango.reducers';
import '../../base';

const restore = utils.restore;
const databaseName = 'testdb';

describe('MangoIndexEditorContainer', function () {

  const middlewares = [thunk];
  const store = createStore(
    combineReducers({
      mangoQuery: mangoReducer,
      indexResults: indexResultsReducer,
      databases: databasesReducer
    }),
    applyMiddleware(...middlewares)
  );

  beforeEach(() => {
    sinon.stub(FauxtonAPI, 'urls').withArgs('mango').returns('mock-url');
  });

  afterEach(() => {
    restore(FauxtonAPI.urls);
  });

  it('has a default index definition', function () {
    const wrapper = mount(
      <Provider store={store}>
        <Views.MangoIndexEditorContainer
          description="foo"
          databaseName={databaseName} />
      </Provider>
    );

    const indexEditor = wrapper.find(MangoIndexEditor);
    expect(indexEditor.exists()).toBe(true);
    if (indexEditor.exists()) {
      const json = JSON.parse(indexEditor.props().queryIndexCode);
      expect(json.index.fields[0]).toBe('foo');
    }
  });

  it('shows partitioned option only for partitioned databases', function () {
    const wrapper = mount(
      <Provider store={store}>
        <Views.MangoIndexEditorContainer
          description="foo"
          databaseName={databaseName} />
      </Provider>
    );
    const indexEditor = wrapper.find(MangoIndexEditor);
    expect(indexEditor.exists()).toBe(true);
    if (indexEditor.exists()) {
      const json = JSON.parse(indexEditor.props().queryIndexCode);
      expect(json.index.fields[0]).toBe('foo');
    }
  });

});

describe('MangoIndexEditor', function () {
  const defaultProps = {
    isLoading: false,
    databaseName: 'db1',
    isDbPartitioned: false,
    saveIndex: () => {},
    queryIndexCode: '{ "selector": {} }',
    partitionKey: '',
    loadIndexTemplates: () => {},
    clearResults: () => {},
    loadIndexList: () => {}
  };

  it('shows partitioned option only for partitioned databases', function () {
    const wrapperNotPartitioned = shallow(
      <MangoIndexEditor
        {...defaultProps}
      />
    );
    expect(wrapperNotPartitioned.find('#js-partitioned-index').exists()).toBe(false);

    const wrapperPartitioned = shallow(
      <MangoIndexEditor
        {...defaultProps}
        isDbPartitioned={true}
      />
    );
    expect(wrapperPartitioned.find('#js-partitioned-index').exists()).toBe(true);
  });

  it('does not add "partitioned" field for non-partitioned dbs', function () {
    const saveIndexStub = sinon.stub();
    const wrapper = mount(
      <MangoIndexEditor
        {...defaultProps}
        saveIndex={saveIndexStub}
      />
    );
    wrapper.find('form.form-horizontal').simulate('submit', { preventDefault: () => {} });
    sinon.assert.called(saveIndexStub);
    const { indexCode } = saveIndexStub.firstCall.args[0];
    expect(indexCode.length).toBeGreaterThan(0);
    expect(indexCode).not.toMatch('"partitioned":');
  });

  it('adds "partitioned: true" field when creating a partitioned index', function () {
    const saveIndexStub = sinon.stub();
    const wrapper = mount(
      <MangoIndexEditor
        {...defaultProps}
        isDbPartitioned={true}
        saveIndex={saveIndexStub}
      />
    );
    wrapper.find('form.form-horizontal').simulate('submit', { preventDefault: () => {} });
    sinon.assert.called(saveIndexStub);
    const { indexCode } = saveIndexStub.firstCall.args[0];
    expect(indexCode.length).toBeGreaterThan(0);
    expect(indexCode).toMatch('"partitioned":true');
  });

  it('adds "partitioned: false" field when creating a global index', function () {
    const saveIndexStub = sinon.stub();
    const wrapper = mount(
      <MangoIndexEditor
        {...defaultProps}
        isDbPartitioned={true}
        saveIndex={saveIndexStub}
      />
    );
    wrapper.find('#js-partitioned-index').simulate('change');
    wrapper.find('form.form-horizontal').simulate('submit', { preventDefault: () => {} });
    sinon.assert.called(saveIndexStub);
    const { indexCode } = saveIndexStub.firstCall.args[0];
    expect(indexCode.length).toBeGreaterThan(0);
    expect(indexCode).toMatch('"partitioned":false');
  });
});

describe('MangoQueryEditorContainer', function () {

  const middlewares = [thunk];
  const store = createStore(
    combineReducers({ mangoQuery: mangoReducer, indexResults: indexResultsReducer }),
    applyMiddleware(...middlewares)
  );

  beforeEach(() => {
    sinon.stub(FauxtonAPI, 'urls').returns('mock-url');
  });

  afterEach(() => {
    restore(FauxtonAPI.urls);
  });

  it('has a default query', function () {
    const wrapper = mount(
      <Provider store={store}>
        <Views.MangoQueryEditorContainer
          description="foo"
          editorTitle="mock-title"
          databaseName={databaseName} />
      </Provider>
    );
    const queryEditor = wrapper.find(MangoQueryEditor);
    expect(queryEditor.exists()).toBe(true);
    if (queryEditor.exists()) {
      const query = JSON.parse(queryEditor.props().queryFindCode);
      expect(query.selector).toHaveProperty('_id');
    }
  });
});

describe('MangoQueryEditor', function () {
  const defaultProps = {
    description: 'desc',
    editorTitle: 'title',
    queryFindCode: '{}',
    queryFindCodeChanged: false,
    databaseName: 'db1',
    partitionKey: '',
    runExplainQuery: () => {},
    runQuery: () => {},
    manageIndexes: () => {},
    loadQueryHistory: () => {},
    clearResults: () => {}
  };

  it('runs explain query with partition when one is set', function () {
    const runExplainQueryStub = sinon.stub();
    const wrapper = mount(
      <MangoQueryEditor
        {...defaultProps}
        partitionKey='part1'
        runExplainQuery={runExplainQueryStub}
      />
    );

    wrapper.find('#explain-btn').simulate('click', { preventDefault: () => {} });
    sinon.assert.called(runExplainQueryStub);
    const { partitionKey } = runExplainQueryStub.firstCall.args[0];
    expect(partitionKey).toBe('part1');
  });

  it('runs explain query with partition when one is set', function () {
    const runQueryStub = sinon.stub();
    const wrapper = mount(
      <MangoQueryEditor
        {...defaultProps}
        partitionKey='part1'
        runQuery={runQueryStub}
      />
    );

    wrapper.find('form.form-horizontal').simulate('submit', { preventDefault: () => {} });
    sinon.assert.called(runQueryStub);
    const { partitionKey } = runQueryStub.firstCall.args[0];
    expect(partitionKey).toBe('part1');
  });
});
