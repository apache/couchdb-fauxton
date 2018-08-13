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
import app from "../../../app";
import ActionTypes from "./actiontypes";
import moment from "moment";
var Stores = {};

// static var used to assign a unique ID to each notification
var counter = 0;
var validNotificationTypes = ['success', 'error', 'info'];


/**
 * Notifications are of the form:
 * {
 *   notificationId: N,
 *   message: "string",
 *   type: "success"|etc. see above list
 *   clear: true|false,
 *   escape: true|false
 * }
 */

Stores.NotificationStore = FauxtonAPI.Store.extend({
  initialize () {
    this.reset();
  },

  reset () {
    this._notifications = [];
    this._notificationCenterVisible = false;
    this._selectedNotificationFilter = 'all';
    this._permanentNotificationVisible = false;
    this._permanentNotificationMessage = '';
  },

  isNotificationCenterVisible () {
    return this._notificationCenterVisible;
  },

  isPermanentNotificationVisible () {
    return this._permanentNotificationVisible;
  },

  addNotification (info) {
    if (_.isEmpty(info.type) || !_.includes(validNotificationTypes, info.type)) {
      console.warn('Invalid message type: ', info);
      return;
    }

    info.notificationId = ++counter;
    info.cleanMsg = app.utils.stripHTML(info.msg);
    info.time = moment();

    // all new notifications are visible by default. They get hidden after their time expires, by the component
    info.visible = true;
    info.isHiding = false;

    // clear: true causes all visible messages to be hidden
    if (info.clear) {
      this._notifications.forEach(function (notification) {
        if (notification.visible) {
          notification.isHiding = true;
        }
      });
    }
    this._notifications.unshift(info);
  },

  getNotifications () {
    return this._notifications;
  },

  getPermanentNotificationMessage () {
    return this._permanentNotificationMessage;
  },

  setPermanentNotificationMessage (content) {
    this._permanentNotificationMessage = content;
  },

  clearNotification (notificationId) {
    this._notifications = _.without(this._notifications, _.find(this._notifications, { notificationId: notificationId }));
  },

  clearNotifications () {
    this._notifications = [];
  },

  hideNotification (notificationId) {
    var notification = _.find(this._notifications, { notificationId: notificationId });
    notification.visible = false;
    notification.isHiding = false;
  },

  hideAllNotifications () {
    this._notifications.forEach(function (notification) {
      if (notification.visible) {
        notification.isHiding = true;
      }
    });
  },

  startHidingNotification (notificationId) {
    var notification = _.find(this._notifications, { notificationId: notificationId });
    notification.isHiding = true;
  },

  getNotificationFilter () {
    return this._selectedNotificationFilter;
  },

  setNotificationFilter (filter) {
    if ((_.isEmpty(filter) || !_.includes(validNotificationTypes, filter)) && filter !== 'all') {
      console.warn('Invalid notification filter: ', filter);
      return;
    }
    this._selectedNotificationFilter = filter;
  },

  dispatch (action) {
    switch (action.type) {
      case ActionTypes.ADD_NOTIFICATION:
        this.addNotification(action.options.info);
        break;

      case ActionTypes.CLEAR_ALL_NOTIFICATIONS:
        this.clearNotifications();
        break;

      case ActionTypes.CLEAR_SINGLE_NOTIFICATION:
        this.clearNotification(action.options.notificationId);
        break;

      case ActionTypes.START_HIDING_NOTIFICATION:
        this.startHidingNotification(action.options.notificationId);
        break;

      case ActionTypes.HIDE_NOTIFICATION:
        this.hideNotification(action.options.notificationId);
        break;

      case ActionTypes.HIDE_ALL_NOTIFICATIONS:
        this.hideAllNotifications();
        break;

      case ActionTypes.SHOW_NOTIFICATION_CENTER:
        this._notificationCenterVisible = true;
        break;

      case ActionTypes.HIDE_NOTIFICATION_CENTER:
        this._notificationCenterVisible = false;
        break;

      case ActionTypes.SELECT_NOTIFICATION_FILTER:
        this.setNotificationFilter(action.options.filter);
        break;

      case ActionTypes.SHOW_PERMANENT_NOTIFICATION:
        this._permanentNotificationVisible = true;
        this.setPermanentNotificationMessage(action.options.msg);
        break;

      case ActionTypes.HIDE_PERMANENT_NOTIFICATION:
        this._permanentNotificationVisible = false;
        break;

      default:
        return;
        // do nothing
    }

    this.triggerChange();
  }
});

Stores.notificationStore = new Stores.NotificationStore();
Stores.notificationStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.notificationStore.dispatch.bind(Stores.notificationStore));

export default Stores;
