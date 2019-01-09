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
import Actions from "../actions";

export class DeleteDatabaseModal extends React.Component {
  static propTypes = {
    showHide: PropTypes.func.isRequired,
    modalProps: PropTypes.object,
    onSuccess: PropTypes.func
  };

  state = {
    inputValue: '',
    disableSubmit: true
  };

  close = (e) => {
    if (e) {
      e.preventDefault();
    }

    this.setState({
      inputValue: '',
      disableSubmit: true
    });

    this.props.showHide({showModal: false});
  };

  open = () => {
    this.props.showHide({showModal: true});
  };

  getDatabaseName = () => {
    return this.props.modalProps.dbId.trim();
  };

  onInputChange = (e) => {
    const val = e.target.value.trim();

    this.setState({
      inputValue: val
    });

    this.setState({
      disableSubmit: val !== this.getDatabaseName()
    });
  };

  onDeleteClick = (e) => {
    e.preventDefault();

    Actions.deleteDatabase(this.getDatabaseName(), this.props.onSuccess);
  };

  onInputKeypress = (e) => {
    if (e.keyCode === 13 && this.state.disableSubmit !== true) {
      Actions.deleteDatabase(this.getDatabaseName(), this.props.onSuccess);
    }
  };

  render() {
    var isSystemDatabase = this.props.modalProps.isSystemDatabase;
    var showDeleteModal = this.props.modalProps.showDeleteModal;
    var dbId = this.props.modalProps.dbId;

    var warning = isSystemDatabase ? (
      <p style={{color: '#d14'}} className="warning">
        <b>You are about to delete a system database, be careful!</b>
      </p>
    ) : null;

    return (
      <Modal dialogClassName="delete-db-modal" show={showDeleteModal} onHide={this.close}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {warning}
          <p>
            Warning: This action will permanently delete <code>{dbId}</code>.
            To confirm the deletion of the database and all of the
            database&apos;s documents, you must enter the database&apos;s name.
          </p>
          <input
            type="text"
            className="input-block-level"
            onKeyUp={this.onInputKeypress}
            onChange={this.onInputChange}
            autoFocus={true} />
        </Modal.Body>
        <Modal.Footer>
          <a href="#" onClick={this.close} data-bypass="true" className="cancel-link">Cancel</a>
          <button
            disabled={this.state.disableSubmit}
            onClick={this.onDeleteClick}
            className="btn btn-danger delete">
            <i className="icon icon-trash" /> Delete Database
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}
