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

import { receivedPermissions } from '../actions';

import React from 'react';
import { mount } from 'enzyme';

import { createStore, applyMiddleware, combineReducers } from 'redux';

import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import reducer from '../reducers';
import PermissionsContainer from '../container/PermissionsContainer';

var fetchMock = require('fetch-mock');

describe('Permissions Container', () => {

  it('renders with new results', () => {

    fetchMock.once("*", {});

    const middlewares = [thunk];
    const store = createStore(
      combineReducers({ permissions: reducer}),
      applyMiddleware(...middlewares)
    );

    const wrapper = mount(
      <Provider store={store}>
        <PermissionsContainer url="http://example.com/abc" />
      </Provider>
    );

    store.dispatch(
      receivedPermissions({
        admins:  { names: ['banana'], roles: [] }
      })
    );

    wrapper.update();
    const item = wrapper
      .find('.permissions__admins .permissions__entry');

    expect(item.text()).toContain('banana');
  });
});
