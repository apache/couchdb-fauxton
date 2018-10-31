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
Stores.deleteDbModalStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.deleteDbModalStore.dispatch.bind(Stores.deleteDbModalStore));

export default Stores;
