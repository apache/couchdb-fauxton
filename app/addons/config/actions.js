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
import Resources from './resources';

export default {
  fetchAndEditConfig (node) {
    FauxtonAPI.dispatch({ type: ActionTypes.LOADING_CONFIG });

    var configModel = new Resources.ConfigModel({ node });

    configModel.fetch().then(() => this.editSections({ sections: configModel.get('sections'), node }));
  },

  editSections (options) {
    FauxtonAPI.dispatch({ type: ActionTypes.EDIT_CONFIG, options });
  },

  editOption (options) {
    FauxtonAPI.dispatch({ type: ActionTypes.EDIT_OPTION, options });
  },

  cancelEdit (options) {
    FauxtonAPI.dispatch({ type: ActionTypes.CANCEL_EDIT, options });
  },

  saveOption (node, options) {
    FauxtonAPI.dispatch({ type: ActionTypes.SAVING_OPTION, options });

    var modelAttrs = options;
    modelAttrs.node = node;
    var optionModel = new Resources.OptionModel(modelAttrs);

    return optionModel.save()
      .then(
        () => this.optionSaveSuccess(options),
        xhr => this.optionSaveFailure(options, JSON.parse(xhr.responseText).reason)
      );
  },

  optionSaveSuccess (options) {
    FauxtonAPI.dispatch({ type: ActionTypes.OPTION_SAVE_SUCCESS, options });
    FauxtonAPI.addNotification({
      msg: `Option ${options.optionName} saved`,
      type: 'success'
    });
  },

  optionSaveFailure (options, error) {
    FauxtonAPI.dispatch({ type: ActionTypes.OPTION_SAVE_FAILURE, options });
    FauxtonAPI.addNotification({
      msg: `Option save failed: ${error}`,
      type: 'error'
    });
  },

  addOption (node, options) {
    FauxtonAPI.dispatch({ type: ActionTypes.ADDING_OPTION });

    var modelAttrs = options;
    modelAttrs.node = node;
    var optionModel = new Resources.OptionModel(modelAttrs);

    return optionModel.save()
      .then(
        () => this.optionAddSuccess(options),
        xhr => this.optionAddFailure(options, JSON.parse(xhr.responseText).reason)
      );
  },

  optionAddSuccess (options) {
    FauxtonAPI.dispatch({ type: ActionTypes.OPTION_ADD_SUCCESS, options });
    FauxtonAPI.addNotification({
      msg: `Option ${options.optionName} added`,
      type: 'success'
    });
  },

  optionAddFailure (options, error) {
    FauxtonAPI.dispatch({ type: ActionTypes.OPTION_ADD_FAILURE, options });
    FauxtonAPI.addNotification({
      msg: `Option add failed: ${error}`,
      type: 'error'
    });
  },

  deleteOption (node, options) {
    FauxtonAPI.dispatch({ type: ActionTypes.DELETING_OPTION, options });

    var modelAttrs = options;
    modelAttrs.node = node;
    var optionModel = new Resources.OptionModel(modelAttrs);

    return optionModel.destroy()
      .then(
        () => this.optionDeleteSuccess(options),
        xhr => this.optionDeleteFailure(options, JSON.parse(xhr.responseText).reason)
      );
  },

  optionDeleteSuccess (options) {
    FauxtonAPI.dispatch({ type: ActionTypes.OPTION_DELETE_SUCCESS, options });
    FauxtonAPI.addNotification({
      msg: `Option ${options.optionName} deleted`,
      type: 'success'
    });
  },

  optionDeleteFailure (options, error) {
    FauxtonAPI.dispatch({ type: ActionTypes.OPTION_DELETE_FAILURE, options });
    FauxtonAPI.addNotification({
      msg: `Option delete failed: ${error}`,
      type: 'error'
    });
  }
};
