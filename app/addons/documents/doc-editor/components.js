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
import PropTypes from 'prop-types';
import React from "react";
import { Dropdown, MenuItem } from "react-bootstrap";
import ReactDOM from "react-dom";
import Actions from "./actions";
import Stores from "./stores";
import FauxtonComponents from "../../fauxton/components";
import GeneralComponents from "../../components/react-components";
import { Modal } from "react-bootstrap";
import Helpers from "../../../helpers";

var store = Stores.docEditorStore;

class DocEditorController extends React.Component {
  static defaultProps = {
    database: {},
    isNewDoc: false
  };

  getStoreState = () => {
    return {
      isLoading: store.isLoading(),
      doc: store.getDoc(),
      cloneDocModalVisible: store.isCloneDocModalVisible(),
      uploadModalVisible: store.isUploadModalVisible(),
      deleteDocModalVisible: store.isDeleteDocModalVisible(),
      numFilesUploaded: store.getNumFilesUploaded(),
      conflictCount: store.getDocConflictCount()
    };
  };

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

  componentDidMount() {
    store.on('change', this.onChange, this);
  }

  componentWillUnmount() {
    store.off('change', this.onChange);
  }

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
    Actions.saveDoc(this.state.doc, this.checkDocIsValid(), this.onSaveComplete);
  };

  onSaveComplete = () => {
    this.getEditor().clearChanges();
  };

  hideDeleteDocModal = () => {
    Actions.hideDeleteDocModal();
  };

  deleteDoc = () => {
    Actions.hideDeleteDocModal();
    Actions.deleteDoc(this.state.doc);
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

        <PanelButton className="upload" title="Upload Attachment" iconClass="icon-circle-arrow-up" onClick={Actions.showUploadModal} />
        <PanelButton title="Clone Document" iconClass="icon-repeat" onClick={Actions.showCloneDocModal} />
        <PanelButton title="Delete" iconClass="icon-trash" onClick={Actions.showDeleteDocModal} />
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

class AttachmentsPanelButton extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    doc: PropTypes.object
  };

  static defaultProps = {
    isLoading: true,
    doc: {}
  };

  getAttachmentList = () => {
    const db = encodeURIComponent(this.props.doc.database.get('id'));
    const doc = encodeURIComponent(this.props.doc.get('_id'));

    return _.map(this.props.doc.get('_attachments'), (item, filename) => {
      const url = FauxtonAPI.urls('document', 'attachment', db, doc, encodeURIComponent(filename));
      return (
        <MenuItem key={filename} href={url} target="_blank" data-bypass="true">
          <strong>{filename}</strong>
          <span className="attachment-delimiter">-</span>
          <span>{item.content_type}{item.content_type ? ', ' : ''}{Helpers.formatSize(item.length)}</span>
        </MenuItem>
      );
    });
  };

  render() {
    if (this.props.isLoading || !this.props.doc.get('_attachments')) {
      return false;
    }

    return (
      <div className="panel-section view-attachments-section btn-group">
        <Dropdown id="view-attachments-menu">
          <Dropdown.Toggle noCaret className="panel-button dropdown-toggle btn" data-bypass="true">
            <i className="icon icon-paper-clip"></i>
            <span className="button-text">View Attachments</span>
            <span className="caret"></span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {this.getAttachmentList()}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }
}

class PanelButton extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string
  };

  static defaultProps = {
    title: '',
    iconClass: '',
    onClick: function () { },
    className: ''
  };

  render() {
    var iconClasses = 'icon ' + this.props.iconClass;
    return (
      <div className="panel-section">
        <button className={`panel-button ${this.props.className}`} title={this.props.title} onClick={this.props.onClick}>
          <i className={iconClasses}></i>
          <span>{this.props.title}</span>
        </button>
      </div>
    );
  }
}

class UploadModal extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    doc: PropTypes.object
  };

  getStoreState = () => {
    return {
      inProgress: store.isUploadInProgress(),
      loadPercentage: store.getUploadLoadPercentage(),
      errorMessage: store.getFileUploadErrorMsg()
    };
  };

  componentDidMount() {
    store.on('change', this.onChange, this);
  }

  componentWillUnmount() {
    store.off('change', this.onChange);
  }

  onChange = () => {
    this.setState(this.getStoreState());
  };

  closeModal = (e) => {
    if (e) {
      e.preventDefault();
    }

    if (this.state.inProgress) {
      Actions.cancelUpload();
    }
    Actions.hideUploadModal();
    Actions.resetUploadModal();
  };

  upload = () => {
    Actions.uploadAttachment({
      doc: this.props.doc,
      rev: this.props.doc.get('_rev'),
      files: this.attachments.files
    });
  };

  state = this.getStoreState();

  render() {
    let errorClasses = 'alert alert-error';
    if (this.state.errorMessage === '') {
      errorClasses += ' hide';
    }
    let loadIndicatorClasses = 'progress progress-info';
    let disabledAttribute = {disabled: 'disabled'};
    if (!this.state.inProgress) {
      loadIndicatorClasses += ' hide';
      disabledAttribute = {};
    }

    return (
      <Modal dialogClassName="upload-file-modal" show={this.props.visible} onHide={this.closeModal}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Upload Attachment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={errorClasses}>{this.state.errorMessage}</div>
          <div>
            <form ref={node => this.uploadForm = node} className="form">
              <p>
                Select a file to upload as an attachment to this document. Uploading a file saves the document as a new
                revision.
              </p>
              <input ref={el => this.attachments = el} type="file" name="_attachments" {...disabledAttribute}/>
              <br />
            </form>

            <div className={loadIndicatorClasses}>
              <div className="bar" style={{ width: this.state.loadPercentage + '%'}}></div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <a href="#" data-bypass="true" className="cancel-link" onClick={this.closeModal}>Cancel</a>
          <button href="#" id="upload-btn" data-bypass="true" className="btn btn-primary save" onClick={this.upload} {...disabledAttribute}>
            <i className="icon icon-upload" /> Upload Attachment
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

class CloneDocModal extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    doc: PropTypes.object,
    database: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired
  };

  state = {
    uuid: null
  };

  cloneDoc = () => {
    if (this.props.onSubmit) {
      this.props.onSubmit();
    }

    Actions.cloneDoc(this.props.database, this.props.doc, this.state.uuid);
  };

  componentDidUpdate() {
    if (this.state.uuid === null) {
      Helpers.getUUID().then((res) => {
        if (res.uuids) {
          this.setState({ uuid: res.uuids[0] });
        }
      }).catch(() => {});
    }
  }

  closeModal = (e) => {
    if (e) {
      e.preventDefault();
    }
    Actions.hideCloneDocModal();
  };

  docIDChange = (e) => {
    this.setState({ uuid: e.target.value });
  };

  render() {
    if (this.state.uuid === null) {
      return false;
    }

    return (
      <Modal dialogClassName="clone-doc-modal" show={this.props.visible} onHide={this.closeModal}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Clone Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form" onSubmit={(e) => { e.preventDefault(); this.cloneDoc(); }}>
            <p>
              Document cloning copies the saved version of the document. Unsaved document changes will be discarded.
            </p>
            <p>
              You can modify the following generated ID for your new document.
            </p>
            <input ref={node => this.newDocId = node} type="text" autoFocus={true} className="input-block-level"
              onChange={this.docIDChange} value={this.state.uuid} />
          </form>
        </Modal.Body>
        <Modal.Footer>
          <a href="#" data-bypass="true" className="cancel-link" onClick={this.closeModal}>Cancel</a>
          <button className="btn btn-primary save" onClick={this.cloneDoc}>
            <i className="icon-repeat"></i> Clone Document
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}


export default {
  DocEditorController: DocEditorController,
  AttachmentsPanelButton: AttachmentsPanelButton,
  UploadModal: UploadModal,
  CloneDocModal: CloneDocModal
};
