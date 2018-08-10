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

import FauxtonAPI from '../../core/api';
import ActionTypes from './actiontypes';

var ConfigStore = FauxtonAPI.Store.extend({
  initialize () {
    this.reset();
  },

  reset () {
    this._sections = {};
    this._loading = true;
    this._editSectionName = null;
    this._editOptionName = null;
  },

  editConfig (sections) {
    this._sections = sections;
    this._loading = false;
    this._editSectionName = null;
    this._editOptionName = null;
  },

  getOptions () {
    var sections = _.sortBy(
      _.map(this._sections, (section, sectionName) => {
        return {
          sectionName,
          options: this.mapSection(section, sectionName)
        };
      }),
      s => s.sectionName
    );

    return _.flatten(_.map(sections, s => s.options));
  },

  mapSection (section, sectionName) {
    var options = _.sortBy(
      _.map(section, (value, optionName) => ({
        editing: this.isEditing(sectionName, optionName),
        sectionName, optionName, value
      })), o => o.optionName
    );

    options[0].header = true;

    return options;
  },

  editOption (sn, on) {
    this._editSectionName = sn;
    this._editOptionName = on;
  },

  isEditing (sn, on) {
    return sn == this._editSectionName && on == this._editOptionName;
  },

  stopEditing () {
    this._editOptionName = null;
    this._editSectionName = null;
  },

  setLoading () {
    this._loading = true;
  },

  isLoading () {
    return this._loading;
  },

  saveOption (sectionName, optionName, value) {
    if (!this._sections[sectionName]) {
      this._sections[sectionName] = {};
    }

    this._sections[sectionName][optionName] = value || true;
  },

  deleteOption (sectionName, optionName) {
    if (this._sections[sectionName]) {
      delete this._sections[sectionName][optionName];

      if (Object.keys(this._sections[sectionName]).length == 0) {
        delete this._sections[sectionName];
      }
    }
  },

  dispatch (action) {
    if (action.options) {
      var sectionName = action.options.sectionName;
      var optionName = action.options.optionName;
      var value = action.options.value;
    }

    switch (action.type) {
      case ActionTypes.EDIT_CONFIG:
        this.editConfig(action.options.sections, action.options.node);
        break;

      case ActionTypes.LOADING_CONFIG:
        this.setLoading();
        break;

      case ActionTypes.EDIT_OPTION:
        this.editOption(sectionName, optionName);
        break;

      case ActionTypes.CANCEL_EDIT:
        this.stopEditing();
        break;

      case ActionTypes.OPTION_SAVE_SUCCESS:
        this.saveOption(sectionName, optionName, value);
        this.stopEditing();
        break;

      case ActionTypes.OPTION_ADD_SUCCESS:
        this.saveOption(sectionName, optionName, value);
        break;

      case ActionTypes.OPTION_DELETE_SUCCESS:
        this.deleteOption(sectionName, optionName);
        break;
    }

    this.triggerChange();
  }
});

var configStore = new ConfigStore();
configStore.dispatchToken = FauxtonAPI.dispatcher.register(configStore.dispatch.bind(configStore));

export default {
  configStore: configStore
};
