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

import React from 'react';
import moment from 'moment';
import app from '../../../app';
import ActionTypes from './actiontypes';
import {toast} from "react-toastify";

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
  info.toastId = ++counter;
  info.time = moment();
  info.cleanMsg = app.utils.stripHTML(info.msg);

  if (info.escape !== true && info.escape !== false) {
    info.escape = true;
  }

  info.htmlMsg = {
    __html: (info.escape ? _.escape(info.cleanMsg) : info.cleanMsg)
  };

  // clear: true causes all visible messages to be hidden
  if (info.clear) {
    const idsToClear = _.map(notifications, 'toastId');

    // Add some delay to prevent weird flickering
    setTimeout(() => {
      idsToClear.forEach(id => toast.dismiss(id));
    }, 800);
  }

  newNotifications.unshift(info);

  toast(<span dangerouslySetInnerHTML={info.htmlMsg}/>, info);

  return newNotifications;
}

function clearNotification({ notifications }, toastId) {
  const idx = notifications.findIndex(el => {
    return el.toastId === toastId;
  });
  if (idx === -1) {
    // no changes
    return notifications;
  }

  const newNotifications = [].concat(notifications);
  newNotifications.splice(idx, 1);

  toast.dismiss(toastId);

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
      toast.dismiss();
      return {
        ...state,
        notifications: []
      };

    case ActionTypes.CLEAR_SINGLE_NOTIFICATION:
      return {
        ...state,
        notifications: clearNotification(state, options.toastId)
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
