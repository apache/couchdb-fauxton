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

define([
  '../../../core/api',
  './actiontypes'
],
function (FauxtonAPI, ActionTypes) {

  function addNotification (notificationInfo) {
    FauxtonAPI.dispatch({
      type: ActionTypes.ADD_NOTIFICATION,
      options: {
        info: notificationInfo
      }
    });
  }

  function showNotificationCenter () {
    FauxtonAPI.dispatch({ type: ActionTypes.SHOW_NOTIFICATION_CENTER });
  }

  function hideNotificationCenter () {
    FauxtonAPI.dispatch({ type: ActionTypes.HIDE_NOTIFICATION_CENTER });
  }

  function clearAllNotifications () {
    FauxtonAPI.dispatch({ type: ActionTypes.CLEAR_ALL_NOTIFICATIONS });
  }

  function clearSingleNotification (notificationId) {
    FauxtonAPI.dispatch({
      type: ActionTypes.CLEAR_SINGLE_NOTIFICATION,
      options: {
        notificationId: notificationId
      }
    });
  }

  function selectNotificationFilter (filter) {
    FauxtonAPI.dispatch({
      type: ActionTypes.SELECT_NOTIFICATION_FILTER,
      options: {
        filter: filter
      }
    });
  }

  return {
    addNotification: addNotification,
    showNotificationCenter: showNotificationCenter,
    hideNotificationCenter: hideNotificationCenter,
    clearAllNotifications: clearAllNotifications,
    clearSingleNotification: clearSingleNotification,
    selectNotificationFilter: selectNotificationFilter
  };

});
