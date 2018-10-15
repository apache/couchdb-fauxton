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
import { mount } from 'enzyme';
import React from 'react';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import PermanentNotification from '../components/PermanentNotification';
import PermanentNotificationContainer from '../components/PermanentNotificationContainer';
import ActionTypes from '../actiontypes';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import notificationsReducer from '../reducers';

describe('PermanentNotification', () => {

  it('doesn\'t render content by default', () => {
    const wrapper = mount(<PermanentNotification visible={false}/>);
    expect(wrapper.find('.perma-warning__content').length).toBe(0);
  });
});

describe('PermanentNotificationContainer', () => {
  const middlewares = [thunk];
  const store = createStore(
    combineReducers({ notifications: notificationsReducer }),
    applyMiddleware(...middlewares)
  );

  it('shows/hides content when the display flag is switched', () => {
    const wrapper = mount(
      <Provider store={store}>
        <PermanentNotificationContainer />
      </Provider>
    );
    store.dispatch({
      type: ActionTypes.SHOW_PERMANENT_NOTIFICATION,
      options: {
        msg: 'Hello World!'
      }
    });

    wrapper.update();
    expect(wrapper.find('.perma-warning__content').html()).toMatch(/Hello World!/);

    store.dispatch({
      type: ActionTypes.HIDE_PERMANENT_NOTIFICATION
    });

    wrapper.update();
    expect(wrapper.find('.perma-warning__content').length).toBe(0);
  });
});

