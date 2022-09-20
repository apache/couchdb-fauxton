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
import React from "react";
import {Modal} from "react-bootstrap";
import ace from "ace-builds";
import Helpers from "../../documents/helpers";

// this appears when the cursor is over a string. It shows an icon in the gutter that opens the modal.
export class StringEditModal extends React.Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
  };

  static defaultProps = {
    visible: false,
    onClose () { },
    onSave () { }
  };

  state = {
    editorInitialized: false
  };

  initAceEditor = (dom_node) => {
    this.editor = ace.edit(dom_node);
    this.editor.setShowPrintMargin(false);
    this.editor.setOption('highlightActiveLine', true);
    this.editor.setTheme('ace/theme/idle_fingers');
    const val = Helpers.parseJSON(this.props.value);
    this.editor.setValue(val, -1);
    if (!this.state.editorInitialized) {
      this.setState({ editorInitialized: true });
    }
  };

  closeModal = () => {
    this.props.onClose();
  };

  save = () => {
    this.props.onSave(this.editor.getValue());
  };

  getSaveBtn = () => {
    return this.state.editorInitialized && (
      <button id="string-edit-save-btn" onClick={this.save} className="btn btn-primary save">
        <i className="fonticon-circle-check"></i> Modify Text
      </button>);
  };

  render() {
    return (
      <Modal className="string-editor-modal" show={this.props.visible} onHide={this.closeModal}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Edit Value <span id="string-edit-header"></span></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div id="modal-error" className="hide alert alert-error"/>
          <div id="string-editor-wrapper">
            <div id="string-editor-container" ref={node => this.initAceEditor(node)} className="doc-code"></div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <a className="cancel-link" onClick={this.closeModal}>Cancel</a>
          { this.getSaveBtn() }
        </Modal.Footer>
      </Modal>
    );
  }
}
