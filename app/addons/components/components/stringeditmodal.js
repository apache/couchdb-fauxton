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
import { Button, Modal } from "react-bootstrap";
import ace from "ace-builds";
import Helpers from "../../documents/helpers";

// this appears when the cursor is over a string. It shows an icon in the gutter that opens the modal.
export class StringEditModal extends React.Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    wordWrapEnabled: PropTypes.bool.isRequired,
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
    this.editor.setOption('wrap', !!this.props.wordWrapEnabled);
    this.editor.setTheme('ace/theme/idle_fingers');
    const val = Helpers.parseJSON(this.props.value);
    this.editor.setValue(val, -1);
    if (!this.state.editorInitialized) {
      this.setState({ editorInitialized: true });
    }
  };

  closeModal = (ev) => {
    if (ev) {
      ev.preventDefault();
    }
    this.props.onClose();
  };

  save = () => {
    this.props.onSave(this.editor.getValue());
  };

  getSaveBtn = () => {
    return this.state.editorInitialized && (
      <Button
        id="string-edit-save-btn"
        onClick={this.save}
        variant="cf-primary">
        <i className="fonticon-circle-check"></i>Modify Text
      </Button>);
  };

  render() {
    return (
      <Modal dialogClassName="string-editor-modal" show={this.props.visible} onHide={this.closeModal} scrollable>
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
          <Button href="#" data-bypass="true" variant="cf-cancel" className="cancel-link" onClick={this.closeModal}>Cancel</Button>
          { this.getSaveBtn() }
        </Modal.Footer>
      </Modal>
    );
  }
}
