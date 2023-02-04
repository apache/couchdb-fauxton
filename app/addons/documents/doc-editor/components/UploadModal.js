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
import { Modal, Button, Form, ProgressBar } from 'react-bootstrap';


export default class UploadModal extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    doc: PropTypes.object,
    inProgress: PropTypes.bool.isRequired,
    uploadPercentage: PropTypes.number.isRequired,
    errorMessage: PropTypes.string,
    cancelUpload: PropTypes.func.isRequired,
    hideUploadModal: PropTypes.func.isRequired,
    resetUploadModal: PropTypes.func.isRequired,
    uploadAttachment: PropTypes.func.isRequired
  };

  constructor (props) {
    super(props);
    this.state = {
      isFileSelected: false,
    };
  }

  closeModal = (e) => {
    if (e) {
      e.preventDefault();
    }

    if (this.props.inProgress) {
      this.props.cancelUpload();
    }
    this.props.hideUploadModal();
    this.props.resetUploadModal();
  };

  upload = () => {
    this.props.uploadAttachment({
      doc: this.props.doc,
      rev: this.props.doc.get('_rev'),
      files: this.attachments.files
    });
  };

  handleSelectedFile = (e) => {
    this.attachments = e.target;
    this.setState({
      isFileSelected: this.attachments && this.attachments.files && this.attachments.files.length > 0
    });
  };


  render() {
    let errorClasses = 'alert alert-error';
    if (this.props.errorMessage === '') {
      errorClasses += ' d-none';
    }

    let loadIndicatorClasses = 'progress progress-info mt-3';
    if (!this.props.inProgress) {
      loadIndicatorClasses += ' d-none';
    }

    this.attachmentsRef = React.createRef();
    const { isFileSelected } = this.state;

    return (
      <Modal dialogClassName="upload-file-modal" show={this.props.visible} onHide={this.closeModal}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Upload Attachment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={errorClasses}>{this.props.errorMessage}</div>
          <div>
            <form className="form">
              <Form.Group>
                <p>
                  Select a file to upload as an attachment to this document. Uploading a file saves the document as a new
                  revision.
                </p>
                <Form.Control
                  onChange={this.handleSelectedFile}
                  type="file"
                  name="_attachments"
                  disabled={this.props.inProgress}
                />
              </Form.Group>
            </form>

            <ProgressBar
              id="upload-progress-bar"
              now={this.props.uploadPercentage}
              className={ loadIndicatorClasses }
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button href="#" data-bypass="true" variant="cf-cancel" className="cancel-link" onClick={this.closeModal}>Cancel</Button>
          <Button
            id="upload-btn"
            data-bypass="true"
            variant="cf-primary"
            onClick={this.upload}
            disabled={this.props.inProgress || !isFileSelected}
            type="button"
          >
            <i className="fonticon-up-circled" /> Upload Attachment
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
