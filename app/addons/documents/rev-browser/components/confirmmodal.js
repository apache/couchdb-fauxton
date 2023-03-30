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
import ReactComponents from "../../../components/react-components";
import { Button, Form, Modal } from "react-bootstrap";

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

  close (ev) {
    if (ev && ev.preventDefault) {
      ev.preventDefault();
    }
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
            Do you want to delete all conflicting revisions for this document?
          </p>
        </Modal.Body>
        <Modal.Footer>

          <div className='col-12'>
            <Form.Check type="checkbox"
              className='do-not-show-again'
              label="Do not show this warning message again"
              onChange={() => { this.setState({checked: !this.state.checked }); }} />
          </div>

          <div className="col-auto">
            <Button href="#"
              variant="cf-cancel"
              className='cancel-link'
              onClick={this.close}
              data-bypass="true"
            >
            Cancel
            </Button>
          </div>
          <div className="col-auto">
            <ConfirmButton
              onClick={this.onDeleteConflicts}
              text="Delete Revisions"
              variant="danger" />
          </div>

        </Modal.Footer>
      </Modal>
    );
  }
}
ConfirmModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  toggleConfirmModal: PropTypes.func.isRequired
};
