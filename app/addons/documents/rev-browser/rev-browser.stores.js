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
import ActionTypes from "./rev-browser.actiontypes";

const Stores = {};

Stores.RevBrowserStore = FauxtonAPI.Store.extend({
  initialize: function () {
    this.reset();
  },

  reset: function () {
    this._revTree = null;

    this._ours = null;
    this._theirs = null;

    this._dropDownData = null;
    this._isDiffViewEnabled = true;

    this._databaseName = null;

    this._showConfirmModal = false;
    this._docToWin = null;
  },

  prepareDropdownData: function (revs) {
    return revs.map((el) => {

      return { value: el, label: el };
    });
  },

  getRevTree: function () {
    return this._revTree;
  },

  getDatabaseName: function () {
    return this._databaseName;
  },

  getOurs: function () {
    return this._ours;
  },

  getTheirs: function () {
    return this._theirs;
  },

  getConflictingRevs: function () {
    return this._conflictingRevs;
  },

  getDropdownData: function () {
    return this._dropDownData;
  },

  getIsDiffViewEnabled: function () {
    return this._isDiffViewEnabled;
  },

  getShowConfirmModal: function () {
    return this._showConfirmModal;
  },

  getDocToWin: function () {
    return this._docToWin;
  },

  dispatch: function (action) {
    switch (action.type) {
      case ActionTypes.REV_BROWSER_REV_TREE_LOADED:
        this._revTree = action.options.tree;
        this._ours = action.options.doc;
        this._conflictingRevs = action.options.conflictingRevs;
        this._theirs = action.options.conflictDoc;

        this._dropDownData = this.prepareDropdownData(this._conflictingRevs);

        this._databaseName = action.options.databaseName;
        break;

      case ActionTypes.REV_BROWSER_DIFF_DOCS_READY:
        this._theirs = action.options.theirs;
        break;

      case ActionTypes.REV_BROWSER_DIFF_ENABLE_DIFF_VIEW:
        this._isDiffViewEnabled = action.options.enableDiff;
        break;

      case ActionTypes.REV_BROWSER_SHOW_CONFIRM_MODAL:
        this._showConfirmModal = action.options.show;
        this._docToWin = action.options.docToWin;
        break;

      default:
        return;
      // do nothing
    }

    this.triggerChange();
  }

});

Stores.revBrowserStore = new Stores.RevBrowserStore();
Stores.revBrowserStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.revBrowserStore.dispatch.bind(Stores.revBrowserStore));

export default Stores;
