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
  "api",
  "addons/cors/actiontypes"
], function (FauxtonAPI, ActionTypes) {

  var CorsStore = FauxtonAPI.Store.extend({

    editCors: function (options) {
      this._cors = options.cors;
      this._httpd = options.httpd;
      this._isEnabled = this._httpd.corsEnabled();
      this._origins = this.createOrigins(this._cors.get('origins'));
    },

    createOrigins: function (origins) {
      if (_.isUndefined(origins)) {
        return [];
      }

      return origins.split(',');
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

      switch (action.type) {
        case ActionTypes.EDIT_CORS:
          this.editCors(action.options);
          this.triggerChange();
        break;

        case ActionTypes.TOGGLE_ENABLE_CORS:
          this.toggleEnableCors();
          this.triggerChange();
        break;

        case ActionTypes.CORS_ADD_ORIGIN:
          this.addOrigin(action.origin);
          this.triggerChange();
        break;

        case ActionTypes.CORS_IS_ALL_ORIGINS:
          this.originChange(action.isAllOrigins);
          this.triggerChange();
        break;

        case ActionTypes.CORS_DELETE_ORIGIN:
          this.deleteOrigin(action.origin);
          this.triggerChange();
        break;

        case ActionTypes.CORS_UPDATE_ORIGIN:
          this.updateOrigin(action.updatedOrigin, action.originalOrigin);
          this.triggerChange();
        break;

        case ActionTypes.CORS_METHOD_CHANGE:
          this.methodChange(action.httpMethod);
          this.triggerChange();
        break;

        default:
          return;
      }
    }

  });


  var corsStore = new CorsStore();

  corsStore.dispatchToken = FauxtonAPI.dispatcher.register(corsStore.dispatch.bind(corsStore));

  return {
    corsStore: corsStore
  };
});
