import FauxtonAPI from '../../core/api';
import ActionTypes from './actiontypes';

function unset(object, sectionName, optionName) {
  if (object[sectionName]) {
    delete object[sectionName][optionName];
  }
}

var ConfigStore = FauxtonAPI.Store.extend({
  initialize: function () {
    this.reset();
  },

  reset: function () {
    this._sections = {};
    this._loading = true;
    this._editSectionName = null;
    this._editOptionName = null;
  },

  editConfig: function (sections) {
    this._sections = sections;
    this._loading = false;
    this._editSectionName = null;
    this._editOptionName = null;
  },

  getOptions: function () {
    var sections = _.sortBy(
      _.map(this._sections, function (section, sectionName) {
        return {
          sectionName,
          options: this.mapSection(section, sectionName)
        };
      }.bind(this)),
      s => s.sectionName
    );

    return _.flatten(_.map(sections, s => s.options));
  },

  mapSection: function (section, sectionName) {
    var options = _.sortBy(
      _.map(section, function (value, optionName) {
        var editing = this.isEditing(sectionName, optionName);

        return { editing, sectionName, optionName, value };
      }.bind(this)), o => o.optionName
    );

    options[0].header = true;

    return options;
  },

  editOption: function (sn, on) {
    this._editSectionName = sn;
    this._editOptionName = on;
  },

  isEditing: function (sn, on) {
    return sn == this._editSectionName && on == this._editOptionName;
  },

  stopEditing: function () {
    this._editOptionName = null;
    this._editSectionName = null;
  },

  setLoading: function () {
    this._loading = true;
  },

  isLoading: function () {
    return this._loading;
  },

  saveOption: function (sectionName, optionName, value) {
    if (!this._sections[sectionName]) {
      this._sections[sectionName] = {};
    }

    this._sections[sectionName][optionName] = value || true;
  },

  deleteOption: function (sectionName, optionName) {
    if (this._sections[sectionName]) {
      delete this._sections[sectionName][optionName];

      if (Object.keys(this._sections[sectionName]).length == 0) {
        delete this._sections[sectionName];
      }
    }
  },

  dispatch: function (action) {
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
