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
  'api',
  'app',
  'addons/components/actiontypes'
],

function (FauxtonAPI, app, ActionTypes) {
  var Stores = {};


  Stores.ComponentStore = FauxtonAPI.Store.extend({
    initialize: function () {
      this.reset();
    },

    reset: function () {
      this._apiBarVisible = true;
      this._endpoint = '';
      this._docURL = FauxtonAPI.constants.DOC_URLS.GENERAL;
    },

    isAPIBarVisible: function () {
      return this._apiBarVisible;
    },

    updateAPIBar: function (settings) {
      if (!_.isUndefined(settings.visible)) {
        this._apiBarVisible = settings.visible;
      }
      if (!_.isUndefined(settings.endpoint)) {
        this._endpoint = settings.endpoint;
      }
      if (!_.isUndefined(settings.docURL)) {
        this._docURL = settings.docURL;
      }
    },

    getEndpoint: function () {
      return this._endpoint;
    },

    getDocURL: function () {
      return this._docURL;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.SHOW_API_BAR:
          this._apiBarVisible = true;
          this.triggerChange();
        break;

        case ActionTypes.HIDE_API_BAR:
          this._apiBarVisible = false;
          this.triggerChange();
        break;

        case ActionTypes.UPDATE_API_BAR:
          this.updateAPIBar(action.options);
          this.triggerChange();
        break;

        default:
        return;
          // do nothing
      }
    }
  });

  Stores.DeleteDbModalStore = FauxtonAPI.Store.extend({
    initialize: function () {
      this.reset();
    },

    reset: function () {
      this._deleteModal = {showDeleteModal: false, dbId: '', isSystemDatabase: false};
    },

    setDeleteModal: function (options) {
      options.isSystemDatabase = app.utils.isSystemDatabase(options.dbId);
      this._deleteModal = options;
    },

    getShowDeleteDatabaseModal: function () {
      return this._deleteModal;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.COMPONENTS_DATABASES_SHOWDELETE_MODAL:
          this.setDeleteModal(action.options);
        break;

        default:
        return;
      }

      this.triggerChange();
    }
  });




  Stores.deleteDbModalStore = new Stores.DeleteDbModalStore();
  Stores.deleteDbModalStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.deleteDbModalStore.dispatch);

  Stores.componentStore = new Stores.ComponentStore();
  Stores.componentStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.componentStore.dispatch);

  return Stores;

});
