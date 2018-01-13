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
import ReactComponents from "../../../components/react-components";
import { Modal } from "react-bootstrap";

const ConfirmButton = ReactComponents.ConfirmButton;

export default class ConfirmModal extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      checked: false
    };

    this.close = this.close.bind(this);
    this.onDeleteConflicts = this.onDeleteConflicts.bind(this);
  }

  close () {
    this.props.toggleConfirmModal(false, null);
  }

  onDeleteConflicts () {
    const hideModal = this.state.checked;
    this.props.onConfirm(this.props.docToWin, hideModal);
  }

  render () {
    return (
      <Modal dialogClassName="delete-conflicts-modal" show={this.props.show} onHide={this.close}>
        <Modal.Header closeButton={false}>
          <Modal.Title>Solve Conflicts</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <i className="icon-warning-sign"></i> Do you want to delete all conflicting revisions for this document?
          </p>


        </Modal.Body>
        <Modal.Footer>
          <div style={{float: 'left', marginTop: '10px'}}>
            <label>
              <input
                style={{margin: '0 5px 3px 0'}}
                onChange={() => { this.setState({checked: !this.state.checked }); }}
                type="checkbox" />
                Do not show this warning message again
            </label>
          </div>
          <a
            style={{marginRight: '10px', cursor: 'pointer'}}
            onClick={this.close}
            data-bypass="true"
          >
            Cancel
          </a>

          <ConfirmButton
            onClick={this.onDeleteConflicts}
            text="Delete Revisions"
            buttonType="btn-danger" />
        </Modal.Footer>
      </Modal>
    );
  }
}
ConfirmModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  toggleConfirmModal: PropTypes.func.isRequired
};
