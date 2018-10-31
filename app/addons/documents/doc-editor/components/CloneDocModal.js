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
import { Modal } from 'react-bootstrap';
import Helpers from '../../../../helpers';


export default class CloneDocModal extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    doc: PropTypes.object,
    database: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    hideCloneDocModal: PropTypes.func.isRequired,
    cloneDoc: PropTypes.func.isRequired
  };

  state = {
    uuid: null
  };

  cloneDoc = () => {
    if (this.props.onSubmit) {
      this.props.onSubmit();
    }

    this.props.cloneDoc(this.props.database, this.props.doc, this.state.uuid);
  };

  componentDidUpdate() {
    if (this.state.uuid === null) {
      Helpers.getUUID().then((res) => {
        if (res.uuids) {
          const newState = { uuid: res.uuids[0] };
          const idx = this.props.doc ? this.props.doc.attributes._id.indexOf(':') : -1;
          if (idx >= 0) {
            const partitionKey = this.props.doc.attributes._id.substring(0, idx);
            newState.uuid = partitionKey + ':' + newState.uuid;
          }
          this.setState(newState);
        }
      }).catch(() => {});
    }
  }

  closeModal = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.props.hideCloneDocModal();
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
