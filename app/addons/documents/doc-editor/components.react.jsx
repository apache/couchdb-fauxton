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
import app from "../../../app";
import React from "react";
import ReactDOM from "react-dom";
import Actions from "./actions";
import Stores from "./stores";
import FauxtonComponents from "../../fauxton/components.react";
import GeneralComponents from "../../components/react-components.react";
import { Modal } from "react-bootstrap";
import Helpers from "../../../helpers";

import DocumentResources from '../resources';

var store = Stores.docEditorStore;

var DocEditorController = React.createClass({

  getInitialState: function () {
    return this.getStoreState();
  },

  getStoreState: function () {
    return {
      isLoading: store.isLoading(),
      doc: store.getDoc(),
      cloneDocModalVisible: store.isCloneDocModalVisible(),
      uploadModalVisible: store.isUploadModalVisible(),
      deleteDocModalVisible: store.isDeleteDocModalVisible(),
      numFilesUploaded: store.getNumFilesUploaded(),
      conflictCount: store.getDocConflictCount()
    };
  },

  getDefaultProps: function () {
    return {
      database: {},
      isNewDoc: false
    };
  },

  getCodeEditor: function () {
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
        ref="docEditor"
        defaultCode={code}
        mode="json"
        autoFocus={true}
        editorCommands={editorCommands}
        notifyUnsavedChanges={true}
        stringEditModalEnabled={true} />
    );
  },

  componentDidMount: function () {
    store.on('change', this.onChange, this);
  },

  componentWillUnmount: function () {
    store.off('change', this.onChange);
  },

  // whenever a file is uploaded, reset the editor
  componentWillUpdate: function (nextProps, nextState) {
    if (this.state.numFilesUploaded !== nextState.numFilesUploaded) {
      this.getEditor().setValue(JSON.stringify(nextState.doc.attributes, null, '  '));
    }
  },

  onChange: function () {
    if (this.isMounted()) {
      this.setState(this.getStoreState());
    }
  },

  saveDoc: function () {
    Actions.saveDoc(this.state.doc, this.checkDocIsValid(), this.onSaveComplete);
  },

  onSaveComplete: function (json) {
    this.getEditor().clearChanges();
  },

  hideDeleteDocModal: function () {
    Actions.hideDeleteDocModal();
  },

  deleteDoc: function () {
    Actions.hideDeleteDocModal();
    Actions.deleteDoc(this.state.doc);
  },

  getEditor: function () {
    return (this.refs.docEditor) ? this.refs.docEditor.getEditor() : null;
  },

  checkDocIsValid: function () {
    if (this.getEditor().hasErrors()) {
      return false;
    }
    var json = JSON.parse(this.getEditor().getValue());
    this.state.doc.clear().set(json, { validate: true });

    return !this.state.doc.validationError;
  },

  clearChanges: function () {
    this.refs.docEditor.clearChanges();
  },

  getExtensionIcons: function () {
    var extensions = FauxtonAPI.getExtensions('DocEditor:icons');
    return _.map(extensions, function (Extension, i) {
      return (<Extension doc={this.state.doc} key={i} database={this.props.database} />);
    }, this);
  },

  getButtonRow: function () {
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
  },

  render: function () {
    var saveButtonLabel = (this.props.isNewDoc) ? 'Create Document' : 'Save Changes';

    return (
      <div>
        <div id="doc-editor-actions-panel">
          <div className="doc-actions-left">
            <button className="save-doc btn btn-success save" type="button" onClick={this.saveDoc}>
              <i className="icon fonticon-ok-circled"></i> {saveButtonLabel}
            </button>
            <div>
              <a href={FauxtonAPI.urls('allDocs', 'app', this.props.database.id)} className="js-back cancel-button">Cancel</a>
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
          ref="uploadModal"
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
});

var AttachmentsPanelButton = React.createClass({

  propTypes: {
    isLoading: React.PropTypes.bool.isRequired,
    doc: React.PropTypes.object
  },

  getDefaultProps: function () {
    return {
      isLoading: true,
      doc: {}
    };
  },

  getAttachmentList: function () {
    var db = this.props.doc.database.get('id');
    var doc = this.props.doc.get('_id');

    return _.map(this.props.doc.get('_attachments'), function (item, filename) {
      var url = FauxtonAPI.urls('document', 'attachment', db, doc, app.utils.safeURLName(filename));
      return (
        <li key={filename}>
          <a href={url} target="_blank" data-bypass="true"> <strong>{filename}</strong>
            <span className="attachment-delimiter">-</span>
            <span>{item.content_type}, {Helpers.formatSize(item.length)}</span>
          </a>
        </li>
      );
    });
  },

  render: function () {
    if (this.props.isLoading || !this.props.doc.get('_attachments')) {
      return false;
    }

    return (
      <div className="panel-section view-attachments-section btn-group">
        <button className="panel-button dropdown-toggle btn" data-bypass="true" data-toggle="dropdown" title="View Attachments"
          id="view-attachments-menu">
          <i className="icon icon-paper-clip"></i>
          <span className="button-text">View Attachments</span>
          <span className="caret"></span>
        </button>
        <ul className="dropdown-menu" role="menu" aria-labelledby="view-attachments-menu">
          {this.getAttachmentList()}
        </ul>
      </div>
    );
  }
});


var PanelButton = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func.isRequired,
    className: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      title: '',
      iconClass: '',
      onClick: function () { },
      className: ''
    };
  },

  render: function () {
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
});


var UploadModal = React.createClass({
  propTypes: {
    visible: React.PropTypes.bool.isRequired,
    doc: React.PropTypes.object
  },

  getInitialState: function () {
    return this.getStoreState();
  },

  getStoreState: function () {
    return {
      inProgress: store.isUploadInProgress(),
      loadPercentage: store.getUploadLoadPercentage(),
      errorMessage: store.getFileUploadErrorMsg()
    };
  },

  closeModal: function (e) {
    if (e) {
      e.preventDefault();
    }

    if (this.state.inProgress) {
      Actions.cancelUpload();
    }
    Actions.hideUploadModal();
    Actions.resetUploadModal();
  },

  upload: function () {
    Actions.uploadAttachment({
      doc: this.props.doc,
      rev: this.props.doc.get('_rev'),
      files: $(ReactDOM.findDOMNode(this.refs.attachments))[0].files
    });
  },

  render: function () {
    var errorClasses = 'alert alert-error';
    if (this.state.errorMessage === '') {
      errorClasses += ' hide';
    }
    var loadIndicatorClasses = 'progress progress-info';
    if (!this.state.inProgress) {
      loadIndicatorClasses += ' hide';
    }

    return (
      <Modal dialogClassName="upload-file-modal" show={this.props.visible} onHide={this.closeModal}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Upload Attachment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={errorClasses}>{this.state.errorMessage}</div>
          <div>
            <form ref="uploadForm" className="form">
              <p>
                Please select the file you want to upload as an attachment to this document. This creates a new
                revision of the document, so it's not necessary to save after uploading.
              </p>
              <input ref="attachments" type="file" name="_attachments" />
              <br />
            </form>

            <div className={loadIndicatorClasses}>
              <div className="bar" style={{ width: this.state.loadPercentage + '%'}}></div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <a href="#" data-bypass="true" className="cancel-link" onClick={this.closeModal}>Cancel</a>
          <button href="#" id="upload-btn" data-bypass="true" className="btn btn-success save" onClick={this.upload}>
            Upload Attachment
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
});


const CloneDocModal = React.createClass({
  propTypes: {
    visible: React.PropTypes.bool.isRequired,
    doc: React.PropTypes.object,
    database: React.PropTypes.object.isRequired,
    onSubmit: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      uuid: null
    };
  },

  cloneDoc: function () {
    if (this.props.onSubmit) {
      this.props.onSubmit();
    }

    Actions.cloneDoc(this.props.database, this.props.doc, this.state.uuid);
  },

  componentDidUpdate: function () {
    //XXX model-code in component
    if (this.state.uuid === null) {
      var uuid = new DocumentResources.UUID();
      uuid.fetch().then(function () {
        this.setState({ uuid: uuid.next() });
      }.bind(this));
    }
  },

  closeModal: function (e) {
    if (e) {
      e.preventDefault();
    }
    Actions.hideCloneDocModal();
  },

  docIDChange: function (e) {
    this.setState({ uuid: e.target.value });
  },

  render: function () {
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
              Set new document's ID:
            </p>
            <input ref="newDocId" type="text" autoFocus={true} className="input-block-level"
              onChange={this.docIDChange} value={this.state.uuid} />
          </form>
        </Modal.Body>
        <Modal.Footer>
          <a href="#" data-bypass="true" className="cancel-link" onClick={this.closeModal}>Cancel</a>
          <button className="btn btn-success save" onClick={this.cloneDoc}>
            <i className="fonticon-ok-circled"></i> Clone Document
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
});


export default {
  DocEditorController: DocEditorController,
  AttachmentsPanelButton: AttachmentsPanelButton,
  UploadModal: UploadModal,
  CloneDocModal: CloneDocModal
};
