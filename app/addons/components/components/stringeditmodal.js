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
import ReactDOM from "react-dom";
import {Modal} from "react-bootstrap";
import ace from "brace";
import Helpers from "../../documents/helpers";
require('brace/mode/javascript');
require('brace/mode/json');
require('brace/theme/idle_fingers');

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

  componentDidMount() {
    if (!this.props.visible) {
      return;
    }
    this.initEditor(this.props.value);
  }

  componentDidUpdate(prevProps) {
    if (!this.props.visible) {
      return;
    }
    var val = '';
    if (!prevProps.visible && this.props.visible) {
      val = Helpers.parseJSON(this.props.value);
    }

    this.initEditor(val);
  }

  initEditor = (val) => {
    this.editor = ace.edit(ReactDOM.findDOMNode(this.refs.stringEditor));
    this.editor.$blockScrolling = Infinity; // suppresses an Ace editor error
    this.editor.setShowPrintMargin(false);
    this.editor.setOption('highlightActiveLine', true);
    this.editor.setTheme('ace/theme/idle_fingers');
    this.editor.setValue(val, -1);
  };

  closeModal = () => {
    this.props.onClose();
  };

  save = () => {
    this.props.onSave(this.editor.getValue());
  };

  render() {
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
          <button id="string-edit-save-btn" onClick={this.save} className="btn btn-primary save">
            <i className="fonticon-circle-check"></i> Modify Text
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}
