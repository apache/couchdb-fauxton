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

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import FauxtonAPI from '../../../../core/api';
import FauxtonComponents from '../../../fauxton/components';
import GeneralComponents from '../../../components/react-components';
import AttachmentsPanelButton from './AttachmentsPanelButton';
import CloneDocModal from './CloneDocModal';
import PanelButton from './PanelButton';
import UploadModal from './UploadModal';


export default class DocEditorScreen extends React.Component {
  static defaultProps = {
    database: {},
    isNewDoc: false
  };

  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    isNewDoc: PropTypes.bool.isRequired,
    isDbPartitioned: PropTypes.bool.isRequired,
    doc: PropTypes.object,
    conflictCount: PropTypes.number.isRequired,
    previousUrl: PropTypes.string,
    saveDoc: PropTypes.func.isRequired,

    isCloneDocModalVisible: PropTypes.bool.isRequired,
    database: PropTypes.object,
    showCloneDocModal: PropTypes.func.isRequired,
    hideCloneDocModal: PropTypes.func.isRequired,
    cloneDoc: PropTypes.func.isRequired,

    isDeleteDocModalVisible: PropTypes.bool.isRequired,
    showDeleteDocModal: PropTypes.func.isRequired,
    hideDeleteDocModal: PropTypes.func.isRequired,
    deleteDoc: PropTypes.func.isRequired,

    isUploadModalVisible: PropTypes.bool.isRequired,
    uploadInProgress: PropTypes.bool.isRequired,
    uploadPercentage: PropTypes.number.isRequired,
    uploadErrorMessage: PropTypes.string,
    numFilesUploaded: PropTypes.number.isRequired,
    showUploadModal: PropTypes.func.isRequired,
    hideUploadModal: PropTypes.func.isRequired,
    cancelUpload: PropTypes.func.isRequired,
    resetUploadModal: PropTypes.func.isRequired,
    uploadAttachment: PropTypes.func.isRequired
  };

  getCodeEditor = () => {
    if (this.props.isLoading) {
      return (<GeneralComponents.LoadLines />);
    }

    const docContent = this.props.doc.attributes;
    if (this.props.isDbPartitioned) {
      if (!docContent._id.includes(':') && !docContent._id.startsWith('_design')) {
        docContent._id = ':' + docContent._id;
      }
    }
    const code = JSON.stringify(docContent, null, '  ');
    const editorCommands = [{
      name: 'save',
      bindKey: { win: 'Ctrl-S', mac: 'Ctrl-S' },
      exec: this.saveDoc
    }];

    return (
      <GeneralComponents.CodeEditor
        id="doc-editor"
        ref={node => this.docEditor = node}
        defaultCode={code}
        disabled={this.props.isSaving}
        mode="json"
        autoFocus={true}
        editorCommands={editorCommands}
        notifyUnsavedChanges={true}
        stringEditModalEnabled={true} />
    );
  };

  UNSAFE_componentWillUpdate(nextProps) {
    // Update the editor whenever a file is uploaded, a doc is cloned, or a new doc is loaded
    if (this.props.numFilesUploaded !== nextProps.numFilesUploaded ||
        this.props.doc && this.props.doc.hasChanged() ||
        (this.props.doc && nextProps.doc && this.props.doc.id !== nextProps.doc.id)) {
      const editor = this.getEditor();
      if (editor) {
        this.getEditor().setValue(JSON.stringify(nextProps.doc.attributes, null, '  '));
      }
      this.onSaveComplete();
    }
  }

  saveDoc = () => {
    this.props.saveDoc(this.props.doc, this.checkDocIsValid(), this.onSaveComplete, this.props.previousUrl);
  };

  onSaveComplete = () => {
    if (this.getEditor()) {
      this.getEditor().clearChanges();
    }
  };

  hideDeleteDocModal = () => {
    this.props.hideDeleteDocModal();
  };

  deleteDoc = () => {
    this.props.hideDeleteDocModal();
    this.props.deleteDoc(this.props.doc);
  };

  getEditor = () => {
    return (this.docEditor) ? this.docEditor.getEditor() : null;
  };

  checkDocIsValid = () => {
    if (this.getEditor().hasErrors()) {
      return false;
    }
    const json = JSON.parse(this.getEditor().getValue());
    this.props.doc.clear().set(json, { validate: true });

    return !this.props.doc.validationError;
  };

  clearChanges = () => {
    if (this.docEditor) {
      this.docEditor.clearChanges();
    }
  };

  getExtensionIcons = () => {
    var extensions = FauxtonAPI.getExtensions('DocEditor:icons');
    return _.map(extensions, (Extension, i) => {
      return (<Extension doc={this.props.doc} key={i} database={this.props.database} />);
    });
  };

  getButtonRow = () => {
    if (this.props.isNewDoc || this.props.doc === null) {
      return false;
    }
    return (
      <div>
        <AttachmentsPanelButton
          doc={this.props.doc}
          isLoading={this.props.isLoading}
          disabled={this.props.isSaving} />
        <div className="doc-editor-extension-icons">{this.getExtensionIcons()}</div>

        {this.props.conflictCount ? <PanelButton
          title={`Conflicts (${this.props.conflictCount})`}
          iconClass="icon-columns"
          className="conflicts"
          disabled={this.props.isSaving}
          onClick={() => { FauxtonAPI.navigate(FauxtonAPI.urls('revision-browser', 'app', this.props.database.safeID(), this.props.doc.id));}}/> : null}

        <PanelButton className="upload"
          title="Upload Attachment"
          iconClass="icon-circle-arrow-up"
          disabled={this.props.isSaving}
          onClick={this.props.showUploadModal} />
        <PanelButton title="Clone Document"
          iconClass="icon-repeat"
          disabled={this.props.isSaving}
          onClick={this.props.showCloneDocModal} />
        <PanelButton title="Delete"
          iconClass="icon-trash"
          disabled={this.props.isSaving}
          onClick={this.props.showDeleteDocModal} />
      </div>
    );
  };

  render() {
    const saveButtonLabel = this.props.isSaving ?
      'Saving...' :
      (this.props.isNewDoc ? 'Create Document' : 'Save Changes');
    const endpoint = this.props.previousUrl ?
      this.props.previousUrl :
      FauxtonAPI.urls('allDocs', 'app', FauxtonAPI.url.encode(this.props.database.id));
    let cancelBtClass = `js-back cancel-button ${this.props.isSaving ? 'cancel-button--disabled' : ''}`;
    return (
      <div>
        <div id="doc-editor-actions-panel">
          <div className="doc-actions-left">
            <button disabled={this.props.isSaving} className="save-doc btn btn-primary save" type="button" onClick={this.saveDoc}>
              <i className="icon fonticon-ok-circled"></i> {saveButtonLabel}
            </button>
            <div>
              <a href={this.props.isSaving ? undefined : `#/${endpoint}`}
                className={cancelBtClass}>Cancel</a>
            </div>
          </div>
          <div className="alignRight">
            {this.getButtonRow()}
          </div>
        </div>

        <div className="code-region">
          <div className="bgEditorGutter"></div>
          <div id="editor-container" className="doc-code">{this.getCodeEditor()}</div>

        </div>

        <UploadModal
          ref={node => this.uploadModal = node}
          visible={this.props.isUploadModalVisible}
          doc={this.props.doc}
          inProgress={this.props.uploadInProgress}
          uploadPercentage={this.props.uploadPercentage}
          errorMessage={this.props.uploadErrorMessage}
          cancelUpload={this.props.cancelUpload}
          hideUploadModal={this.props.hideUploadModal}
          resetUploadModal={this.props.resetUploadModal}
          uploadAttachment={this.props.uploadAttachment}/>
        <CloneDocModal
          doc={this.props.doc}
          database={this.props.database}
          visible={this.props.isCloneDocModalVisible}
          onSubmit={this.clearChanges}
          hideCloneDocModal={this.props.hideCloneDocModal}
          cloneDoc={this.props.cloneDoc}/>
        <span id='hey'>bb</span>
        <FauxtonComponents.ConfirmationModal
          title="Confirm Deletion"
          visible={this.props.isDeleteDocModalVisible}
          text="Are you sure you want to delete this document?"
          onClose={this.hideDeleteDocModal}
          onSubmit={this.deleteDoc}
          successButtonLabel="Delete Document" />
      </div>
    );
  }
}
