//  Licensed under the Apache License, Version 2.0 (the "License"); you may not
//  use this file except in compliance with the License. You may obtain a copy of
//  the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
//  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
//  License for the specific language governing permissions and limitations under
//  the License.

import ActionTypes from './actiontypes';
import FauxtonAPI from '../../core/api';
import * as ConfigAPI from './api';

export const fetchAndEditConfig = (node) => (dispatch) => {
  dispatch({ type: ActionTypes.LOADING_CONFIG });

  ConfigAPI.fetchConfig(node).then(res => {
    dispatch({
      type: ActionTypes.EDIT_CONFIG,
      options: {
        sections: res.sections,
        node
      }
    });
  }).catch(err => {
    FauxtonAPI.addNotification({
      msg: 'Failed to load the configuration. ' + err.message,
      type: 'error',
      clear: true
    });
    dispatch({
      type: ActionTypes.EDIT_CONFIG,
      options: {
        sections: [],
        node
      }
    });
  });
};

export const editOption = (options) => (dispatch) => {
  dispatch({ type: ActionTypes.EDIT_OPTION, options });
};

export const cancelEdit = (options) => (dispatch) => {
  dispatch({ type: ActionTypes.CANCEL_EDIT, options });
};

export const saveOption = (node, options) => (dispatch) => {
  dispatch({ type: ActionTypes.SAVING_OPTION, options });

  const { sectionName, optionName, value } = options;
  return ConfigAPI.saveConfigOption(node, sectionName, optionName, value).then(
    () => optionSaveSuccess(options, dispatch)
  ).catch(
    (err) => optionSaveFailure(options, err.message, dispatch)
  );
};

const optionSaveSuccess = (options, dispatch) => {
  dispatch({ type: ActionTypes.OPTION_SAVE_SUCCESS, options });
  FauxtonAPI.addNotification({
    msg: `Option ${options.optionName} saved`,
    type: 'success'
  });
};

const optionSaveFailure = (options, error, dispatch) => {
  dispatch({ type: ActionTypes.OPTION_SAVE_FAILURE, options });
  FauxtonAPI.addNotification({
    msg: `Option save failed: ${error}`,
    type: 'error'
  });
};

export const addOption = (node, options) => (dispatch) => {
  dispatch({ type: ActionTypes.ADDING_OPTION });

  const { sectionName, optionName, value } = options;
  return ConfigAPI.saveConfigOption(node, sectionName, optionName, value).then(
    () => optionAddSuccess(options, dispatch)
  ).catch(
    (err) => optionAddFailure(options, err.message, dispatch)
  );
};

const optionAddSuccess = (options, dispatch) => {
  dispatch({ type: ActionTypes.OPTION_ADD_SUCCESS, options });
  FauxtonAPI.addNotification({
    msg: `Option ${options.optionName} added`,
    type: 'success'
  });
};

const optionAddFailure = (options, error, dispatch) => {
  dispatch({ type: ActionTypes.OPTION_ADD_FAILURE, options });
  FauxtonAPI.addNotification({
    msg: `Option add failed: ${error}`,
    type: 'error'
  });
};

export const deleteOption = (node, options) => (dispatch) => {
  dispatch({ type: ActionTypes.DELETING_OPTION, options });

  const { sectionName, optionName } = options;
  return ConfigAPI.deleteConfigOption(node, sectionName, optionName).then(
    () => optionDeleteSuccess(options, dispatch)
  ).catch(
    (err) => optionDeleteFailure(options, err.message, dispatch)
  );
};

const optionDeleteSuccess = (options, dispatch) => {
  dispatch({ type: ActionTypes.OPTION_DELETE_SUCCESS, options });
  FauxtonAPI.addNotification({
    msg: `Option ${options.optionName} deleted`,
    type: 'success'
  });
};

const optionDeleteFailure = (options, error, dispatch) => {
  dispatch({ type: ActionTypes.OPTION_DELETE_FAILURE, options });
  FauxtonAPI.addNotification({
    msg: `Option delete failed: ${error}`,
    type: 'error'
  });
};
