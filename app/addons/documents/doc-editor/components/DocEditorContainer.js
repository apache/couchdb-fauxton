import { connect } from 'react-redux';
import Actions from '../actions';
import DocEditorScreen from './DocEditorScreen';

const mapStateToProps = ({ docEditor }, ownProps) => {
  return {
    isLoading: docEditor.isLoading,
    isNewDoc: ownProps.isNewDoc,
    doc: docEditor.doc,
    database: ownProps.database,
    conflictCount: docEditor.docConflictCount,

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
    saveDoc: (doc, isValidDoc, onSave) => {
      Actions.saveDoc(doc, isValidDoc, onSave);
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
