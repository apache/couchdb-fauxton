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
//

import ActionTypes from './actiontypes';
import FauxtonAPI from '../../core/api';
import Resources from './resources';

export default {
  fetchAndEditConfig: function (node) {
    FauxtonAPI.dispatch({ type: ActionTypes.LOADING_CONFIG });

    var configModel = new Resources.ConfigModel({ node });

    FauxtonAPI.when(configModel.fetch())
      .then(function () {
        this.editSections({ sections: configModel.get('sections'), node });
      }.bind(this));
  },

  editSections: function (options) {
    FauxtonAPI.dispatch({ type: ActionTypes.EDIT_CONFIG, options });
  },

  editOption: function (options) {
    FauxtonAPI.dispatch({ type: ActionTypes.EDIT_OPTION, options });
  },

  cancelEdit: function (options) {
    FauxtonAPI.dispatch({ type: ActionTypes.CANCEL_EDIT, options });
  },

  saveOption: function (node, options) {
    FauxtonAPI.dispatch({ type: ActionTypes.SAVING_OPTION, options });

    var modelAttrs = options;
    modelAttrs.node = node;
    var optionModel = new Resources.OptionModel(modelAttrs);

    FauxtonAPI.when(optionModel.save())
      .done(function () {
        this.optionSaveSuccess(options);
      }.bind(this))
      .fail(function (xhr) {
          var error = JSON.parse(xhr.responseText).reason;
          this.optionSaveFailure(options, error);
        }.bind(this)
      );
  },

  optionSaveSuccess: function (options) {
    FauxtonAPI.dispatch({ type: ActionTypes.OPTION_SAVE_SUCCESS, options });
    FauxtonAPI.addNotification({
      msg: `Option ${options.optionName} saved`,
      type: 'success'
    });
  },

  optionSaveFailure: function (options, error) {
    FauxtonAPI.dispatch({ type: ActionTypes.OPTION_SAVE_FAILURE, options });
    FauxtonAPI.addNotification({
      msg: `Option save failed: ${error}`,
      type: 'error'
    });
  },

  addOption: function (node, options) {
    FauxtonAPI.dispatch({ type: ActionTypes.ADDING_OPTION });

    var modelAttrs = options;
    modelAttrs.node = node;
    var optionModel = new Resources.OptionModel(modelAttrs);

    FauxtonAPI.when(optionModel.save())
      .done(function () {
        this.optionAddSuccess(options);
      }.bind(this))
      .fail(function (xhr) {
        var error = JSON.parse(xhr.responseText).reason;
        this.optionAddFailure(options, error);
      }.bind(this));
  },

  optionAddSuccess: function (options) {
    FauxtonAPI.dispatch({ type: ActionTypes.OPTION_ADD_SUCCESS, options });
    FauxtonAPI.addNotification({
      msg: `Option ${options.optionName} added`,
      type: 'success'
    });
  },

  optionAddFailure: function (options, error) {
    FauxtonAPI.dispatch({ type: ActionTypes.OPTION_ADD_FAILURE, options });
    FauxtonAPI.addNotification({
      msg: `Option add failed: ${error}`,
      type: 'error'
    });
  },

  deleteOption: function (node, options) {
    FauxtonAPI.dispatch({ type: ActionTypes.DELETING_OPTION, options });

    var modelAttrs = options;
    modelAttrs.node = node;
    var optionModel = new Resources.OptionModel(modelAttrs);

    FauxtonAPI.when(optionModel.destroy())
      .done(function success () {
        this.optionDeleteSuccess(options);
      }.bind(this))
      .fail(function failure (xhr) {
        var error = JSON.parse(xhr.responseText).reason;
        this.optionDeleteFailure(options, error);
      }.bind(this));
  },

  optionDeleteSuccess: function (options) {
    FauxtonAPI.dispatch({ type: ActionTypes.OPTION_DELETE_SUCCESS, options });
    FauxtonAPI.addNotification({
      msg: `Option ${options.optionName} deleted`,
      type: 'success'
    });
  },

  optionDeleteFailure: function (options, error) {
    FauxtonAPI.dispatch({ type: ActionTypes.OPTION_DELETE_FAILURE, options });
    FauxtonAPI.addNotification({
      msg: `Option delete failed: ${error}`,
      type: 'error'
    });
  }
};
