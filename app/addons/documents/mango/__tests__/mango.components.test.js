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
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import FauxtonAPI from '../../../../core/api';
import utils from '../../../../../test/mocha/testUtils';
import databasesReducer from '../../../databases/reducers';
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

import indexResultsReducer from '../../index-results/reducers';
import Views from '../mango.components';
import MangoQueryEditor from '../components/MangoQueryEditor';
import MangoIndexEditor from '../components/MangoIndexEditor';
import mangoReducer from '../mango.reducers';
import '../../base';
import ExplainPage from '../components/ExplainPage';
import {explainPlan, explainPlanCandidates} from './sampleexplainplan';

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
    executionStatsSupported: true,
    runExplainQuery: () => {},
    runQuery: () => {},
    manageIndexes: () => {},
    loadQueryHistory: () => {},
    clearResults: () => {},
    checkExecutionStatsSupport: () => {},
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

    wrapper.find('button#explain-btn').simulate('click', { preventDefault: () => {} });
    sinon.assert.called(runExplainQueryStub);
    const { partitionKey } = runExplainQueryStub.firstCall.args[0];
    expect(partitionKey).toBe('part1');
  });

  it('runs query with partition when one is set', function () {
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

  it('opens cheatsheet modal', async () => {
    const wrapper = mount(
      <MangoQueryEditor
        {...defaultProps}
      />
    );

    const modalSelector = '.modal-dialog.mango-cheatsheet-modal';
    // Confirm modal is not open yet
    expect(wrapper.find(modalSelector).exists()).toBe(false);
    // Open modal
    wrapper.find('.cheatsheet-icon').simulate('click');
    await act(async () => {
      wrapper.update();
    });
    // Confirm modal is open
    const modal = wrapper.find(modalSelector);
    expect(modal.exists()).toBe(true);
    expect(modal.text()).toContain('Query Cheatsheet');
  });

  it('shows execution stats empty body message', function () {
    const wrapper = mount(
      <MangoQueryEditor
        {...defaultProps}
        executionStatsSupported
      />
    );

    expect(wrapper.find('.execution-stats .execution-stats-empty-body').exists()).toBe(true);
  });

  it('shows execution stats values without warning', function () {
    const sampleStats = {
      total_keys_examined: 1,
      total_docs_examined: 19,
      total_quorum_docs_examined: 0,
      results_returned: 18,
      execution_time_ms: 3.231,
    };
    const wrapper = mount(
      <MangoQueryEditor
        {...defaultProps}
        executionStatsSupported
        executionStats={sampleStats}
      />
    );

    // warning should not be shown
    expect(wrapper.find('.execution-stats .warning').exists()).toBe(false);

    const statsPanel = wrapper.find('.execution-stats .execution-stats-body');
    expect(statsPanel.exists()).toBe(true);
    // Deliberately not checking for exact date values, as they are subject to change due to TZ formatting
    expect(statsPanel.text()).toContain('Executed at:');
    expect(statsPanel.text()).toContain('Execution time: 3 ms');
    expect(statsPanel.text()).toContain('Results returned: 18');
    expect(statsPanel.text()).toContain('Keys examined: 1');
    expect(statsPanel.text()).toContain('Documents examined: 19');
    expect(statsPanel.text()).toContain('Documents examined (quorum): 0');
  });

  it('shows execution stats warning when provided', function () {
    const wrapper = mount(
      <MangoQueryEditor
        {...defaultProps}
        executionStatsSupported
        warning={"sample warning"}
      />
    );

    // warning should not be shown
    const warning = wrapper.find('.execution-stats .warning');
    expect(warning.exists()).toBe(true);
    expect(warning.text()).toContain('sample warning');
  });
});

describe('Explain Page', function() {
  it('shows suitable/unsuitable indexes when avaiable', function() {
    const wrapper = mount(
      <ExplainPage explainPlan = {explainPlanCandidates} />
    );
    expect(wrapper.find('#explain-parsed-view .btn.active.btn-cf-secondary')).toHaveLength(1);
    const headers = wrapper.find('.explain-plan-section-title');
    const panels = wrapper.find('.row.explain-index-panel');
    expect(headers).toHaveLength(3);
    expect(panels).toHaveLength(5);

    expect((headers.get(0)).props.children).toContain('Selected Index');
    expect((panels.get(1)).props.children[0]).toMatchObject(/foo-json-index/);

    expect((headers.get(1)).props.children).toContain('Suitable Indexes');
    expect((panels.get(1)).props.children[0]).toMatchObject(/foo-test-json-index/);

    expect((headers.get(2)).props.children).toContain('Unsuitable Indexes');
    expect((panels.get(2)).props.children[0]).toMatchObject(/_all_docs/);

  });

  it('toggles between parsed and json, with no candidate indexes', function() {
    const wrapper = mount(
      <ExplainPage explainPlan = {explainPlan} />
    );

    expect(wrapper.find('#explain-parsed-view .btn.active.btn-cf-secondary')).toHaveLength(1);
    expect(((wrapper.find('.explain-plan-section-title')).get(0)).props.children).toContain('Selected Index');
    wrapper.find('button#explain-json-view').simulate('click');
    expect(wrapper.find('#explain-json-view .btn.active.btn-cf-secondary')).toHaveLength(1);
    expect(((wrapper.find('.explain-plan-section-title')).get(0)).props.children).toContain('JSON Response');
  });
});
