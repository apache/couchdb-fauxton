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

import ActionTypes from "./actiontypes";

const initialState = {
  doc: null,
  isLoading: true,
  isSaving: false,
  cloneDocModalVisible: false,
  deleteDocModalVisible: false,
  uploadModalVisible: false,

  numFilesUploaded: 0,
  uploadErrorMessage: '',
  uploadInProgress: false,
  uploadPercentage: 0,

  docConflictCount: 0
};

export default function docEditor (state = initialState, action) {
  const { options, type } = action;
  switch (type) {

    case ActionTypes.RESET_DOC:
      return {
        ...initialState
      };

    case ActionTypes.DOC_LOADED:
      const conflictCount = options.doc.get('_conflicts') ? options.doc.get('_conflicts').length : 0;
      options.doc.unset('_conflicts');
      return {
        ...state,
        isLoading: false,
        doc: options.doc,
        docConflictCount: conflictCount,
      };

    case ActionTypes.SHOW_CLONE_DOC_MODAL:
      return {
        ...state,
        cloneDocModalVisible: true
      };

    case ActionTypes.HIDE_CLONE_DOC_MODAL:
      return {
        ...state,
        cloneDocModalVisible: false
      };

    case ActionTypes.SHOW_DELETE_DOC_CONFIRMATION_MODAL:
      return {
        ...state,
        deleteDocModalVisible: true
      };

    case ActionTypes.HIDE_DELETE_DOC_CONFIRMATION_MODAL:
      return {
        ...state,
        deleteDocModalVisible: false
      };

    case ActionTypes.SHOW_UPLOAD_MODAL:
      return {
        ...state,
        uploadModalVisible: true
      };

    case ActionTypes.HIDE_UPLOAD_MODAL:
      return {
        ...state,
        uploadModalVisible: false
      };

    case ActionTypes.FILE_UPLOAD_SUCCESS:
      return {
        ...state,
        numFilesUploaded: state.numFilesUploaded + 1
      };

    case ActionTypes.FILE_UPLOAD_ERROR:
      return {
        ...state,
        uploadInProgress: false,
        uploadPercentage: 0,
        uploadErrorMessage: options.error
      };

    case ActionTypes.RESET_UPLOAD_MODAL:
      return {
        ...state,
        uploadInProgress: false,
        uploadPercentage: 0,
        uploadErrorMessage: ''
      };

    case ActionTypes.START_FILE_UPLOAD:
      return {
        ...state,
        uploadInProgress: true,
        uploadPercentage: 0,
        fileUploadErrorMsg: ''
      };

    case ActionTypes.SET_FILE_UPLOAD_PERCENTAGE:
      return {
        ...state,
        uploadPercentage: options.percent
      };

    case ActionTypes.SAVING_DOCUMENT:
      return {
        ...state,
        isSaving: true,
      };

    case ActionTypes.SAVING_DOCUMENT_COMPLETED:
      return {
        ...state,
        isSaving: false,
      };

    default:
      return state;
  }
}
