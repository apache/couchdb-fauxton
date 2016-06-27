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

import FauxtonAPI from "../../core/api";
import app from "../../app";
import ActionTypes from "./actiontypes";
var Stores = {};

Stores.ComponentStore = FauxtonAPI.Store.extend({
  initialize: function () {
    this.reset();
  },

  reset: function () {
    this._apiBarVisible = false;
    this._apiBarButtonVisible = true;
    this._endpoint = '';
    this._docURL = FauxtonAPI.constants.DOC_URLS.GENERAL;
  },

  updateAPIBar: function (settings) {
    this._apiBarVisible = settings.contentVisible;
    this._apiBarButtonVisible = settings.buttonVisible;
    this._endpoint = settings.endpoint;
    this._docURL = settings.docURL;
  },

  setVisibleButton: function (state) {
    this._apiBarButtonVisible = state;
  },

  setApiBarVisible: function (state) {
    this._apiBarVisible = state;
  },

  getEndpoint: function () {
    return this._endpoint;
  },

  getDocURL: function () {
    return this._docURL;
  },

  getIsAPIBarButtonVisible: function () {
    return this._apiBarButtonVisible;
  },

  getIsAPIBarVisible: function () {
    return this._apiBarVisible;
  },

  dispatch: function (action) {
    switch (action.type) {
      case ActionTypes.CMPNTS_SHOW_API_BAR_BUTTON:
        this.setVisibleButton(true);
      break;

      case ActionTypes.CMPNTS_HIDE_API_BAR_BUTTON:
        this.setVisibleButton(false);
      break;

      case ActionTypes.CMPNTS_SET_API_BAR_CONTENT_VISIBLE_STATE:
        this.setApiBarVisible(action.options);
      break;

      case ActionTypes.CMPNTS_UPDATE_API_BAR:
        this.updateAPIBar(action.options);
      break;

      default:
      return;
        // do nothing
    }

    this.triggerChange();
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
      case ActionTypes.CMPNTS_DATABASES_SHOWDELETE_MODAL:
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

export default Stores;
