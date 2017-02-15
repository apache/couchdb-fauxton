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

import React from "react";
import ReactDOM from "react-dom";
import {Modal} from "react-bootstrap";
import Helpers from "../../documents/helpers";

function ensureAce(callback) {
  // dynamically load brace because it's large
  require.ensure([
    'brace',
    'brace/mode/javascript',
    'brace/mode/json',
    'brace/theme/idle_fingers'
  ], callback);
}

// this appears when the cursor is over a string. It shows an icon in the gutter that opens the modal.
export const StringEditModal = React.createClass({

  propTypes: {
    value: React.PropTypes.string.isRequired,
    visible: React.PropTypes.bool.isRequired,
    onClose: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired
  },

  getDefaultProps () {
    return {
      visible: false,
      onClose () { },
      onSave () { }
    };
  },

  componentDidMount () {
    if (!this.props.visible) {
      return;
    }
    this.initEditor(this.props.value);
  },

  componentDidUpdate (prevProps) {
    if (!this.props.visible) {
      return;
    }
    var val = '';
    if (!prevProps.visible && this.props.visible) {
      val = Helpers.parseJSON(this.props.value);
    }

    this.initEditor(val);
  },

  initEditor(val) {
    var self = this;
    ensureAce(function () {
      self.initEditorAsync(val);
    });
  },
  initEditorAsync (val) {
    this.editor = require('brace').edit(ReactDOM.findDOMNode(this.refs.stringEditor));
    this.editor.$blockScrolling = Infinity; // suppresses an Ace editor error
    this.editor.setShowPrintMargin(false);
    this.editor.setOption('highlightActiveLine', true);
    this.editor.setTheme('ace/theme/idle_fingers');
    this.editor.setValue(val, -1);
  },

  closeModal () {
    this.props.onClose();
  },

  save () {
    this.props.onSave(this.editor.getValue());
  },

  render () {
    return (
      <Modal dialogClassName="string-editor-modal" show={this.props.visible} onHide={this.closeModal}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Edit Value <span id="string-edit-header"></span></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div id="modal-error" className="hide alert alert-error"/>
          <div id="string-editor-wrapper"><div ref="stringEditor" className="doc-code"></div></div>
        </Modal.Body>
        <Modal.Footer>
          <a className="cancel-link" onClick={this.closeModal}>Cancel</a>
          <button id="string-edit-save-btn" onClick={this.save} className="btn btn-success save">
            <i className="fonticon-circle-check"></i> Modify Text
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
});
