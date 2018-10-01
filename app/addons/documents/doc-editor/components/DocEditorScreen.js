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


export class DocEditorScreen extends React.Component {
  static defaultProps = {
    database: {},
    isNewDoc: false
  };

  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    doc: PropTypes.object,
    isCloneDocModalVisible: PropTypes.bool.isRequired,
    isUploadModalVisible: PropTypes.bool.isRequired,
    isDeleteDocModalVisible: PropTypes.bool.isRequired,
    numFilesUploaded: PropTypes.number.isRequired,
    conflictCount: PropTypes.number.isRequired,
    saveDoc: PropTypes.func.isRequired,
    hideDeleteDocModal: PropTypes.func.isRequired,
    deleteDoc: PropTypes.func.isRequired,
    showUploadModal: PropTypes.func.isRequired,
    showCloneDocModal: PropTypes.func.isRequired,
    showDeleteDocModal: PropTypes.func.isRequired
  }

  // getStoreState = () => {
  //   return {
  //     isLoading: store.isLoading(),
  //     doc: store.getDoc(),
  //     cloneDocModalVisible: store.isCloneDocModalVisible(),
  //     uploadModalVisible: store.isUploadModalVisible(),
  //     deleteDocModalVisible: store.isDeleteDocModalVisible(),
  //     numFilesUploaded: store.getNumFilesUploaded(),
  //     conflictCount: store.getDocConflictCount()
  //   };
  // };

  getCodeEditor = () => {
    if (this.state.isLoading) {
      return (<GeneralComponents.LoadLines />);
    }

    var code = JSON.stringify(this.state.doc.attributes, null, '  ');
    var editorCommands = [{
      name: 'save',
      bindKey: { win: 'Ctrl-S', mac: 'Ctrl-S' },
      exec: this.saveDoc
    }];

    return (
      <GeneralComponents.CodeEditor
        id="doc-editor"
        ref={node => this.docEditor = node}
        defaultCode={code}
        mode="json"
        autoFocus={true}
        editorCommands={editorCommands}
        notifyUnsavedChanges={true}
        stringEditModalEnabled={true} />
    );
  };

  // componentDidMount() {
  //   store.on('change', this.onChange, this);
  // }

  // componentWillUnmount() {
  //   store.off('change', this.onChange);
  // }

  UNSAFE_componentWillUpdate(nextProps, nextState) {
    // Update the editor whenever a file is uploaded, a doc is cloned, or a new doc is loaded
    if (this.state.numFilesUploaded !== nextState.numFilesUploaded ||
        this.state.doc && this.state.doc.hasChanged() ||
        (this.state.doc && nextState.doc && this.state.doc.id !== nextState.doc.id)) {
      this.getEditor().setValue(JSON.stringify(nextState.doc.attributes, null, '  '));
      this.onSaveComplete();
    }
  }

  onChange = () => {
    this.setState(this.getStoreState());
  };

  saveDoc = () => {
    this.props.saveDoc(this.state.doc, this.checkDocIsValid(), this.onSaveComplete);
  };

  onSaveComplete = () => {
    this.getEditor().clearChanges();
  };

  hideDeleteDocModal = () => {
    this.props.hideDeleteDocModal();
  };

  deleteDoc = () => {
    this.props.hideDeleteDocModal();
    this.props.deleteDoc(this.state.doc);
  };

  getEditor = () => {
    return (this.docEditor) ? this.docEditor.getEditor() : null;
  };

  checkDocIsValid = () => {
    if (this.getEditor().hasErrors()) {
      return false;
    }
    var json = JSON.parse(this.getEditor().getValue());
    this.state.doc.clear().set(json, { validate: true });

    return !this.state.doc.validationError;
  };

  clearChanges = () => {
    this.docEditor.clearChanges();
  };

  getExtensionIcons = () => {
    var extensions = FauxtonAPI.getExtensions('DocEditor:icons');
    return _.map(extensions, (Extension, i) => {
      return (<Extension doc={this.state.doc} key={i} database={this.props.database} />);
    });
  };

  getButtonRow = () => {
    if (this.props.isNewDoc) {
      return false;
    }
    return (
      <div>
        <AttachmentsPanelButton doc={this.state.doc} isLoading={this.state.isLoading} />
        <div className="doc-editor-extension-icons">{this.getExtensionIcons()}</div>

        {this.state.conflictCount ? <PanelButton
          title={`Conflicts (${this.state.conflictCount})`}
          iconClass="icon-columns"
          className="conflicts"
          onClick={() => { FauxtonAPI.navigate(FauxtonAPI.urls('revision-browser', 'app', this.props.database.safeID(), this.state.doc.id));}}/> : null}

        <PanelButton className="upload" title="Upload Attachment" iconClass="icon-circle-arrow-up" onClick={this.props.showUploadModal} />
        <PanelButton title="Clone Document" iconClass="icon-repeat" onClick={this.props.showCloneDocModal} />
        <PanelButton title="Delete" iconClass="icon-trash" onClick={this.props.showDeleteDocModal} />
      </div>
    );
  };

  state = this.getStoreState();

  render() {
    var saveButtonLabel = (this.props.isNewDoc) ? 'Create Document' : 'Save Changes';
    let endpoint = FauxtonAPI.urls('allDocs', 'app', FauxtonAPI.url.encode(this.props.database.id));
    return (
      <div>
        <div id="doc-editor-actions-panel">
          <div className="doc-actions-left">
            <button className="save-doc btn btn-primary save" type="button" onClick={this.saveDoc}>
              <i className="icon fonticon-ok-circled"></i> {saveButtonLabel}
            </button>
            <div>
              <a href={`#/${endpoint}`} className="js-back cancel-button">Cancel</a>
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
          visible={this.state.uploadModalVisible}
          doc={this.state.doc} />
        <CloneDocModal
          doc={this.state.doc}
          database={this.props.database}
          visible={this.state.cloneDocModalVisible}
          onSubmit={this.clearChanges} />
        <FauxtonComponents.ConfirmationModal
          title="Confirm Deletion"
          visible={this.state.deleteDocModalVisible}
          text="Are you sure you want to delete this document?"
          onClose={this.hideDeleteDocModal}
          onSubmit={this.deleteDoc}
          successButtonLabel="Delete Document" />
      </div>
    );
  }
}
