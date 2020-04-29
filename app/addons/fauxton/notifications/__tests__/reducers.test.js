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

import reducer from '../reducers';
import ActionTypes from '../actiontypes';

describe('Notifications Reducer', () => {

  it('sets reasonable defaults', () => {
    const newState = reducer(undefined, { type: 'DO_NOTHING'});
    expect(newState.notifications.length).toBe(0);
    expect(newState.notificationCenterVisible).toBe(false);
    expect(newState.selectedNotificationFilter).toBe('all');
  });

  it('confirm only known notification types get added', () => {
    const action = {
      type: ActionTypes.ADD_NOTIFICATION,
      options: {
        info: { msg: 'Hey there!', type: 'info' }
      }
    };

    let newState = reducer(undefined, action);
    expect(newState.notifications.length).toBe(1);

    action.options.info.type = 'success';
    newState = reducer(newState, action);
    expect(newState.notifications.length).toBe(2);

    action.options.info.type = 'error';
    newState = reducer(newState, action);
    expect(newState.notifications.length).toBe(3);

    action.options.info.type = 'rhubarb';
    newState = reducer(newState, action);
    expect(newState.notifications.length).toBe(3);
  });

  it('notifications should be escaped by default', () => {
    const action = {
      type: ActionTypes.ADD_NOTIFICATION,
      options: {
        info: { msg: '<script>window.whatever=1;</script>', type: 'info' }
      }
    };
    let newState = reducer(undefined, action);
    expect(newState.notifications[0].escape).toBe(true);
  });

  it('clears a specific notification', () => {
    const action = {
      type: ActionTypes.ADD_NOTIFICATION,
      options: {
        info: { msg: 'one', type: 'success' }
      }
    };

    let newState = reducer(undefined, action);
    action.options.info.msg = 'two';
    newState = reducer(newState, action);
    action.options.info.msg = 'three';
    newState = reducer(newState, action);
    action.options.info.msg = 'four';
    newState = reducer(newState, action);
    expect(newState.notifications.length).toBe(4);

    const idToRemove = newState.notifications[1].toastId;
    const msgToRemove = newState.notifications[1].msg;
    newState = reducer(newState, {
      type: ActionTypes.CLEAR_SINGLE_NOTIFICATION,
      options: { toastId: idToRemove }
    });
    expect(newState.notifications.length).toBe(3);
    const item = newState.notifications.find(el => {
      return el.msg === msgToRemove;
    });
    expect(item).not.toBeDefined();
  });

  it('setNotificationFilter only sets for known notification types', () => {
    const action = {
      type: ActionTypes.SELECT_NOTIFICATION_FILTER,
      options: { filter: 'all' }
    };
    let newState = reducer(undefined, { type: 'DO_NOTHING' });
    const validFilters = ['all', 'success', 'error', 'info'];
    validFilters.forEach(filter => {
      action.options.filter = filter;
      newState = reducer(newState, action);
      expect(newState.selectedNotificationFilter).toBe(filter);
    });

    action.options.filter = 'invalid_filter';
    newState = reducer(newState, action);
    expect(newState.selectedNotificationFilter).toBe(validFilters[validFilters.length - 1]);
  });

  it('clear all notifications', () => {
    const action = {
      type: ActionTypes.ADD_NOTIFICATION,
      options: {
        info: { msg: 'one', type: 'success' }
      }
    };

    let newState = reducer(undefined, action);
    action.options.info.msg = 'two';
    newState = reducer(newState, action);
    action.options.info.msg = 'three';
    newState = reducer(newState, action);
    action.options.info.msg = 'four';
    newState = reducer(newState, action);
    expect(newState.notifications.length).toBe(4);

    newState = reducer(newState, {
      type: ActionTypes.CLEAR_ALL_NOTIFICATIONS
    });
    expect(newState.notifications.length).toBe(0);
  });

});
