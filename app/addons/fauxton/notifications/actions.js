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

import ActionTypes from './actiontypes';

export const addNotification = (notificationInfo) => (dispatch) => {
  dispatch({
    type: ActionTypes.ADD_NOTIFICATION,
    options: {
      info: notificationInfo
    }
  });
};

export const showNotificationCenter = () => (dispatch) => {
  dispatch({ type: ActionTypes.SHOW_NOTIFICATION_CENTER });
};

export const hideNotificationCenter = () => (dispatch) => {
  dispatch({ type: ActionTypes.HIDE_NOTIFICATION_CENTER });
};

export const clearAllNotifications = () => (dispatch) => {
  dispatch({ type: ActionTypes.CLEAR_ALL_NOTIFICATIONS });
};

export const clearSingleNotification = (toastId) => (dispatch) => {
  dispatch({
    type: ActionTypes.CLEAR_SINGLE_NOTIFICATION,
    options: {
      toastId: toastId
    }
  });
};

export const selectNotificationFilter = (filter) => (dispatch) => {
  dispatch({
    type: ActionTypes.SELECT_NOTIFICATION_FILTER,
    options: {
      filter: filter
    }
  });
};
