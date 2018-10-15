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

import moment from 'moment';
import app from '../../../app';
import ActionTypes from './actiontypes';

const initialState = {
  notifications: [],
  notificationCenterVisible: false,
  selectedNotificationFilter: 'all',
  permanentNotificationVisible: false,
  permanentNotificationMessage: ''
};

let counter = 0;
const validNotificationTypes = ['success', 'error', 'info'];
const validFilters = ['all', 'success', 'error', 'info'];

function addNotification ({ notifications }, info) {
  const newNotifications = notifications.slice();
  info = { ...info };
  info.notificationId = ++counter;
  info.cleanMsg = app.utils.stripHTML(info.msg);
  info.time = moment();
  if (info.escape !== true && info.escape !== false) {
    info.escape = true;
  }

  // all new notifications are visible by default. They get hidden after their time expires, by the component
  info.visible = true;
  info.isHiding = false;

  // clear: true causes all visible messages to be hidden
  if (info.clear) {
    newNotifications.forEach((notification) => {
      if (notification.visible) {
        notification.isHiding = true;
      }
    });
  }
  newNotifications.unshift(info);
  return newNotifications;
}

function clearNotification({ notifications }, notificationId) {
  const idx = notifications.findIndex(el => {
    return el.notificationId === notificationId;
  });
  if (idx === -1) {
    // no changes
    return notifications;
  }

  const newNotifications = [].concat(notifications);
  newNotifications.splice(idx, 1);
  return newNotifications;
}

function startHidingNotification({ notifications }, notificationId) {
  const idx = notifications.findIndex(el => {
    return el.notificationId === notificationId;
  });
  if (idx === -1) {
    // no changes
    return notifications;
  }

  const newNotifications = [].concat(notifications);
  newNotifications[idx].isHiding = true;
  return newNotifications;
}

function hideNotification({ notifications }, notificationId) {
  const idx = notifications.findIndex(el => {
    return el.notificationId === notificationId;
  });
  if (idx === -1) {
    // no changes
    return notifications;
  }

  const newNotifications = [].concat(notifications);
  newNotifications[idx].visible = false;
  newNotifications[idx].isHiding = false;
  return newNotifications;
}

function hideAllNotifications({ notifications }) {
  const newNotifications = [].concat(notifications);
  newNotifications.forEach((notification) => {
    if (notification.visible) {
      notification.isHiding = true;
    }
  });
  return newNotifications;
}

export default function notifications(state = initialState, action) {
  const { options, type } = action;
  switch (type) {

    case ActionTypes.ADD_NOTIFICATION:
      if (!validNotificationTypes.includes(options.info.type)) {
        return state;
      }
      return {
        ...state,
        notifications: addNotification(state, options.info)
      };

    case ActionTypes.CLEAR_ALL_NOTIFICATIONS:
      return {
        ...state,
        notifications: []
      };

    case ActionTypes.CLEAR_SINGLE_NOTIFICATION:
      return {
        ...state,
        notifications: clearNotification(state, options.notificationId)
      };

    case ActionTypes.START_HIDING_NOTIFICATION:
      return {
        ...state,
        notifications: startHidingNotification(state, options.notificationId)
      };

    case ActionTypes.HIDE_NOTIFICATION:
      return {
        ...state,
        notifications: hideNotification(state, options.notificationId)
      };

    case ActionTypes.HIDE_ALL_NOTIFICATIONS:
      return {
        ...state,
        notifications: hideAllNotifications(state)
      };

    case ActionTypes.SHOW_NOTIFICATION_CENTER:
      return {
        ...state,
        notificationCenterVisible: true
      };

    case ActionTypes.HIDE_NOTIFICATION_CENTER:
      return {
        ...state,
        notificationCenterVisible: false
      };

    case ActionTypes.SELECT_NOTIFICATION_FILTER:
      if (!validFilters.includes(options.filter)) {
        return state;
      }
      return {
        ...state,
        selectedNotificationFilter: options.filter
      };

    case ActionTypes.SHOW_PERMANENT_NOTIFICATION:
      return {
        ...state,
        permanentNotificationVisible: true,
        permanentNotificationMessage: options.msg
      };

    case ActionTypes.HIDE_PERMANENT_NOTIFICATION:
      return {
        ...state,
        permanentNotificationVisible: false
      };

    default:
      return state;
  }
}
