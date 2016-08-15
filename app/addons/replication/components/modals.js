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
import React from 'react';
import {Modal} from 'react-bootstrap';
import Components from '../../components/react-components.react';

const {ConfirmButton} = Components;


export const DeleteModal = ({
  visible,
  onClose,
  onClick,
  multipleDocs
}) => {

  if (!visible) {
    return null;
  }

  let header = "You are deleting a replication document.";

  if (multipleDocs > 1) {
    header = `You are deleting ${multipleDocs} replication documents.`;
  }

  return (
    <Modal dialogClassName="replication_delete-doc-modal" show={visible} onHide={() => onClose()}>
      <Modal.Header closeButton={true}>
        <Modal.Title>Verify Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{header}</p>
        <p>
          Deleting a replication document stops continuous replication
          and incomplete one-time replication, but does not affect replicated documents.
        </p>
        <p>
          Replication jobs that do not have replication documents do not appear in Replcator DB Activity.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <a className="cancel-link" onClick={onClose}>Cancel</a>
        <ConfirmButton
          text={"Delete Document"}
          onClick={onClick}
        />
      </Modal.Footer>
    </Modal>
  );
};

DeleteModal.propTypes = {
  visible: React.PropTypes.bool.isRequired,
  onClick: React.PropTypes.func.isRequired,
  onClose: React.PropTypes.func.isRequired,
  multipleDocs: React.PropTypes.number.isRequired
};

export const ErrorModal = ({visible, onClose, errorMsg, onClick}) => {

  if (!visible) {
    return null;
  }

  return (
    <Modal dialogClassName="replication_error-doc-modal" show={visible} onHide={() => onClose()}>
      <Modal.Header closeButton={true}>
        <Modal.Title>Replication Error</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {errorMsg}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn"
          onClick={onClick}
            >
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

ErrorModal.propTypes = {
  visible: React.PropTypes.bool.isRequired,
  onClick: React.PropTypes.func.isRequired,
  onClose: React.PropTypes.func.isRequired,
  errorMsg: React.PropTypes.string.isRequired
};

export const ConflictModal = ({visible, docId, onClose, onClick}) => {

  if (!visible) {
    return null;
  }

  return (
    <Modal dialogClassName="replication_error-doc-modal" show={visible} onHide={() => onClose()}>
      <Modal.Header closeButton={true}>
        <Modal.Title>Fix Document Conflict</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          A replication document with ID <code>{docId}</code> already exists.
        </p>
        <p>
          You can overwrite the existing document, or change the new replication job’s document ID.
        </p>
        <p>
          If you overwrite the existing document, any replication job currently using the replication document will stop,
          and that job will not appear in Replicator DB Activity. Replicationed documents will not be affected.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <button onClick={onClose} className="btn replication_error-cancel">
          Change Document ID
        </button>
        <button onClick={onClick} className="btn replication_error-continue">
          <i className="icon icon-eraser"></i>
          Overwrite Existing Document
        </button>
      </Modal.Footer>
    </Modal>
  );
};

ConflictModal.propTypes = {
  visible: React.PropTypes.bool.isRequired,
  onClick: React.PropTypes.func.isRequired,
  onClose: React.PropTypes.func.isRequired,
  docId: React.PropTypes.string.isRequired
};
