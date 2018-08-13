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

import FauxtonAPI from "../../../core/api";
import ActionTypes from "./actiontypes";
var Stores = {};

Stores.DesignDocInfoStore = FauxtonAPI.Store.extend({

  initialize: function () {
    this._isLoading = true;
  },

  isLoading: function () {
    return this._isLoading;
  },

  getDdocName: function () {
    return this._ddocName;
  },

  getDesignDocInfo: function () {
    return this._designDocInfo;
  },

  monitorDesignDoc: function (options) {
    this._isLoading = false;
    this._designDocInfo = options.designDocInfo;
    this._ddocName = options.ddocName;
    this._intervalId = options.intervalId;
  },

  getIntervalId: function () {
    return this._intervalId;
  },

  getViewIndex: function () {
    if (this._isLoading) {
      return {};
    }

    return this._designDocInfo.get('view_index');
  },

  dispatch: function (action) {
    switch (action.type) {
      case ActionTypes.DESIGN_FETCHING:
        this._isLoading = true;
        this.triggerChange();
        break;

      case ActionTypes.DESIGN_DOC_MONITOR:
        this.monitorDesignDoc(action.options);
        this.triggerChange();
        break;

      case ActionTypes.DESIGN_DOC_REFRESH:
        this.triggerChange();
        break;

      default:
        return;
      // do nothing
    }
  }

});

Stores.designDocInfoStore = new Stores.DesignDocInfoStore();

Stores.designDocInfoStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.designDocInfoStore.dispatch.bind(Stores.designDocInfoStore));

export default Stores;
