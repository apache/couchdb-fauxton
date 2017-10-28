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
import {Modal} from 'react-bootstrap';
import Components from '../../components/react-components';

const {ConfirmButton} = Components;


export const DeleteModal = ({
  visible,
  onClose,
  onClick,
  multipleDocs,
  isReplicationDB
}) => {

  if (!visible) {
    return null;
  }

  let header = "";
  let btnText = `Delete ${isReplicationDB ? 'Document' : 'Replication Job'}`;
  let infoSection = `Deleting a replication ${isReplicationDB ? 'document' : 'job'} stops continuous replication
          and incomplete one-time replication, but does not affect replicated documents.`;

  if (multipleDocs > 1) {
    header = `You are deleting <strong>${multipleDocs}</strong> replication ${isReplicationDB ? 'documents' : 'jobs'}.`;
    btnText = `Delete ${isReplicationDB ? 'Documents' : 'Replication Jobs'}`;
  }

  return (
    <Modal dialogClassName="replication_delete-doc-modal" show={visible} onHide={() => onClose()}>
      <Modal.Header closeButton={true}>
        <Modal.Title>Verify Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p dangerouslySetInnerHTML={{__html: header}}></p>
        <p>{infoSection}</p>
      </Modal.Body>
      <Modal.Footer>
        <a className="cancel-link" onClick={onClose}>Cancel</a>
        <ConfirmButton
          customIcon={"icon-trash"}
          text={btnText}
          onClick={onClick}
        />
      </Modal.Footer>
    </Modal>
  );
};

DeleteModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  isReplicationDB: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  multipleDocs: PropTypes.number.isRequired
};

DeleteModal.defaultProps = {
  isReplicationDB: true
};

export const ErrorModal = ({visible, onClose, errorMsg, status}) => {

  if (!visible) {
    return null;
  }

  let title = "Replication Error";
  let warning = <p>The replication job will be tried at increasing intervals</p>;

  if (status.toLowerCase() === 'failed') {
    title = "Replication Error - Failed";
    warning = null;
  }

  return (
    <Modal dialogClassName="replication__error-doc-modal" show={visible} onHide={() => onClose()}>
      <Modal.Header closeButton={true}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {errorMsg}
        </p>
        {warning}
      </Modal.Body>
      <Modal.Footer>
      </Modal.Footer>
    </Modal>
  );
};

ErrorModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  errorMsg: PropTypes.string.isRequired
};

export const ConflictModal = ({visible, docId, onClose, onClick}) => {

  if (!visible) {
    return null;
  }

  return (
    <Modal dialogClassName="replication__error-doc-modal" show={visible} onHide={() => onClose()}>
      <Modal.Header closeButton={true}>
        <Modal.Title>Custom ID Conflict</Modal.Title>
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
          and that job will not appear in Replicator DB Activity. Replicated documents will not be affected.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <button onClick={onClose} className="btn replication__error-cancel">
          Change Document ID
        </button>
        <button onClick={onClick} className="btn replication__error-continue">
          <i className="icon icon-eraser" /> Overwrite Existing Document
        </button>
      </Modal.Footer>
    </Modal>
  );
};

ConflictModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  docId: PropTypes.string.isRequired
};
