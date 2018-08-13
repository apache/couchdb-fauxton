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

Stores.DocEditorStore = FauxtonAPI.Store.extend({
  initialize: function () {
    this.reset();
  },

  reset: function () {
    this._doc = null;
    this._isLoading = true;
    this._cloneDocModalVisible = false;
    this._deleteDocModalVisible = false;
    this._uploadModalVisible = false;

    // file upload-related fields
    this._numFilesUploaded = 0;
    this._fileUploadErrorMsg = '';
    this._uploadInProgress = false;
    this._fileUploadLoadPercentage = 0;

    this._docConflictCount = null;
  },

  isLoading: function () {
    return this._isLoading;
  },

  getDocConflictCount: function () {
    return this._docConflictCount;
  },

  docLoaded: function (options) {
    this._isLoading = false;
    this._docConflictCount = options.doc.get('_conflicts') ? options.doc.get('_conflicts').length : 0;
    options.doc.unset('_conflicts');
    this._doc = options.doc;
  },

  getDoc: function () {
    return this._doc;
  },

  isCloneDocModalVisible: function () {
    return this._cloneDocModalVisible;
  },

  showCloneDocModal: function () {
    this._cloneDocModalVisible = true;
  },

  hideCloneDocModal: function () {
    this._cloneDocModalVisible = false;
  },

  isDeleteDocModalVisible: function () {
    return this._deleteDocModalVisible;
  },

  showDeleteDocModal: function () {
    this._deleteDocModalVisible = true;
  },

  hideDeleteDocModal: function () {
    this._deleteDocModalVisible = false;
  },

  isUploadModalVisible: function () {
    return this._uploadModalVisible;
  },

  showUploadModal: function () {
    this._uploadModalVisible = true;
  },

  hideUploadModal: function () {
    this._uploadModalVisible = false;
  },

  getNumFilesUploaded: function () {
    return this._numFilesUploaded;
  },

  getFileUploadErrorMsg: function () {
    return this._fileUploadErrorMsg;
  },

  setFileUploadErrorMsg: function (error) {
    this._uploadInProgress = false;
    this._fileUploadLoadPercentage = 0;
    this._fileUploadErrorMsg = error;
  },

  isUploadInProgress: function () {
    return this._uploadInProgress;
  },

  getUploadLoadPercentage: function () {
    return this._fileUploadLoadPercentage;
  },

  resetUploadModal: function () {
    this._uploadInProgress = false;
    this._fileUploadLoadPercentage = 0;
    this._fileUploadErrorMsg = '';
  },

  startFileUpload: function () {
    this._uploadInProgress = true;
    this._fileUploadLoadPercentage = 0;
    this._fileUploadErrorMsg = '';
  },

  dispatch: function (action) {
    switch (action.type) {
      case ActionTypes.RESET_DOC:
        this.reset();
        break;

      case ActionTypes.DOC_LOADED:
        this.docLoaded(action.options);
        this.triggerChange();
        break;

      case ActionTypes.SHOW_CLONE_DOC_MODAL:
        this.showCloneDocModal();
        this.triggerChange();
        break;

      case ActionTypes.HIDE_CLONE_DOC_MODAL:
        this.hideCloneDocModal();
        this.triggerChange();
        break;

      case ActionTypes.SHOW_DELETE_DOC_CONFIRMATION_MODAL:
        this.showDeleteDocModal();
        this.triggerChange();
        break;

      case ActionTypes.HIDE_DELETE_DOC_CONFIRMATION_MODAL:
        this.hideDeleteDocModal();
        this.triggerChange();
        break;

      case ActionTypes.SHOW_UPLOAD_MODAL:
        this.showUploadModal();
        this.triggerChange();
        break;

      case ActionTypes.HIDE_UPLOAD_MODAL:
        this.hideUploadModal();
        this.triggerChange();
        break;

      case ActionTypes.FILE_UPLOAD_SUCCESS:
        this._numFilesUploaded++;
        this.triggerChange();
        break;

      case ActionTypes.FILE_UPLOAD_ERROR:
        this.setFileUploadErrorMsg(action.options.error);
        this.triggerChange();
        break;

      case ActionTypes.RESET_UPLOAD_MODAL:
        this.resetUploadModal();
        this.triggerChange();
        break;

      case ActionTypes.START_FILE_UPLOAD:
        this.startFileUpload();
        this.triggerChange();
        break;

      case ActionTypes.SET_FILE_UPLOAD_PERCENTAGE:
        this._fileUploadLoadPercentage = action.options.percent;
        this.triggerChange();
        break;


      default:
        return;
      // do nothing
    }
  }

});

Stores.docEditorStore = new Stores.DocEditorStore();
Stores.docEditorStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.docEditorStore.dispatch.bind(Stores.docEditorStore));

export default Stores;
