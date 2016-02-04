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
  "../../core/api",
  "./actiontypes"
], function (FauxtonAPI, ActionTypes) {

  var CorsStore = FauxtonAPI.Store.extend({

    editCors: function (options) {
      this._isEnabled = options.isEnabled;
      this._origins = options.origins;
      this._configChanged = false;
      this._shouldSaveChange = false;
      this._node = options.node;
      this._isLoading = false;
    },

    shouldSaveChange: function () {
      return this._shouldSaveChange;
    },

    hasConfigChanged: function () {
      return this._configChanged;
    },

    setConfigChanged: function () {
      this._configChanged = true;
    },

    setConfigSaved: function () {
      this._configChanged = false;
    },

    setIsLoading: function (state) {
      this._isLoading = state;
      this._shouldSaveChange = false;
    },

    getIsLoading: function () {
      return this._isLoading;
    },

    isEnabled: function () {
      return this._isEnabled;
    },

    addOrigin: function (origin) {
      this._origins.push(origin);
    },

    deleteOrigin: function (origin) {
      var index = _.indexOf(this._origins, origin);

      if (index === -1) { return; }

      this._origins.splice(index, 1);
    },

    originChange: function (isAllOrigins) {
      if (isAllOrigins) {
        this._origins = ['*'];
        return;
      }

      this._origins = [];
    },

    getOrigins: function () {
      return this._origins;
    },

    getNode: function () {
      return this._node;
    },

    isAllOrigins: function () {
      var origins = this.getOrigins();
      if (_.include(origins, '*')) {
        return true;
      }

      return false;
    },

    toggleEnableCors: function () {
      this._isEnabled = !this._isEnabled;
    },

    updateOrigin: function (updatedOrigin, originalOrigin) {
      this.deleteOrigin(originalOrigin);
      this.addOrigin(updatedOrigin);
    },

    dispatch: function (action) {
      // it should save after any change is triggered except for EDIT_CORS which is just to update
      // cors after the first change
      this._shouldSaveChange = true;

      switch (action.type) {
        case ActionTypes.EDIT_CORS:
          this.editCors(action.options);
        break;

        case ActionTypes.TOGGLE_ENABLE_CORS:
          this.toggleEnableCors();
          this.setConfigChanged();
        break;

        case ActionTypes.CORS_ADD_ORIGIN:
          this.addOrigin(action.origin);
          this.setConfigChanged();
        break;

        case ActionTypes.CORS_IS_ALL_ORIGINS:
          this.originChange(action.isAllOrigins);
          this.setConfigChanged();
        break;

        case ActionTypes.CORS_DELETE_ORIGIN:
          this.deleteOrigin(action.origin);
          this.setConfigChanged();
        break;

        case ActionTypes.CORS_UPDATE_ORIGIN:
          this.updateOrigin(action.updatedOrigin, action.originalOrigin);
          this.setConfigChanged();
        break;

        case ActionTypes.CORS_SET_IS_LOADING:
          this.setIsLoading(action.isLoading);
        break;

        default:
        return;
      }

      this.triggerChange();
    }

  });


  var corsStore = new CorsStore();

  corsStore.dispatchToken = FauxtonAPI.dispatcher.register(corsStore.dispatch.bind(corsStore));

  return {
    corsStore: corsStore
  };
});
