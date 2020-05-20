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

import { connect } from 'react-redux';
import Actions from '../actions';
import DocEditorScreen from './DocEditorScreen';

const mapStateToProps = ({ docEditor, databases }, ownProps) => {
  return {
    isLoading: docEditor.isLoading || databases.isLoadingDbInfo,
    isSaving: docEditor.isSaving,
    isNewDoc: ownProps.isNewDoc,
    isDbPartitioned: databases.isDbPartitioned,
    doc: docEditor.doc,
    database: ownProps.database,
    conflictCount: docEditor.docConflictCount,
    previousUrl: ownProps.previousUrl,
    isCloneDocModalVisible: docEditor.cloneDocModalVisible,

    isDeleteDocModalVisible: docEditor.deleteDocModalVisible,

    isUploadModalVisible: docEditor.uploadModalVisible,
    uploadInProgress: docEditor.uploadInProgress,
    uploadPercentage: docEditor.uploadPercentage,
    uploadErrorMessage: docEditor.uploadErrorMessage,
    numFilesUploaded: docEditor.numFilesUploaded
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    saveDoc: (doc, isValidDoc, onSave, navigateToUrl) => {
      dispatch(Actions.saveDoc(doc, isValidDoc, onSave, navigateToUrl));
    },

    showCloneDocModal: () => {
      dispatch(Actions.showCloneDocModal());
    },
    hideCloneDocModal: () => {
      dispatch(Actions.hideCloneDocModal());
    },
    cloneDoc: (database, doc, newId) => {
      Actions.cloneDoc(database, doc, newId);
    },

    showDeleteDocModal: () => {
      dispatch(Actions.showDeleteDocModal());
    },
    hideDeleteDocModal: () => {
      dispatch(Actions.hideDeleteDocModal());
    },
    deleteDoc: (doc) => {
      Actions.deleteDoc(doc);
    },

    showUploadModal: () => {
      dispatch(Actions.showUploadModal());
    },
    hideUploadModal: () => {
      dispatch(Actions.hideUploadModal());
    },
    cancelUpload: () => {
      Actions.cancelUpload();
    },
    resetUploadModal: () => {
      dispatch(Actions.resetUploadModal());
    },
    uploadAttachment: (params) => {
      dispatch(Actions.uploadAttachment(params));
    }
  };
};

const DocEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DocEditorScreen);

export default DocEditorContainer;
