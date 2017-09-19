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

import FauxtonAPI from "../../../../core/api";
import Views from "../mango.components";
import MangoQueryEditor from "../components/MangoQueryEditor";
import MangoIndexEditor from "../components/MangoIndexEditor";
import utils from "../../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import sinon from "sinon";
import { mount } from 'enzyme';

import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import mangoReducer from '../mango.reducers';
import indexResultsReducer from '../../index-results/reducers';

const assert = utils.assert;
const restore = utils.restore;
const databaseName = 'testdb';

describe('Mango IndexEditor', function () {

  const middlewares = [thunk];
  const store = createStore(
    combineReducers({ mangoQuery: mangoReducer, indexResults: indexResultsReducer }),
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
    assert.ok(indexEditor.exists());
    if (indexEditor.exists()) {
      const json = JSON.parse(indexEditor.props().queryIndexCode);
      assert.equal(json.index.fields[0], 'foo');
    }
  });

});

describe('Mango QueryEditor', function () {

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
    assert.ok(queryEditor.exists());
    if (queryEditor.exists()) {
      const query = JSON.parse(queryEditor.props().queryFindCode);
      assert.property(query.selector, '_id');
    }
  });
});
