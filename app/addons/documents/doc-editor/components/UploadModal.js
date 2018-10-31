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

  render() {
    let errorClasses = 'alert alert-error';
    if (this.props.errorMessage === '') {
      errorClasses += ' hide';
    }
    let loadIndicatorClasses = 'progress progress-info';
    let disabledAttribute = {disabled: 'disabled'};
    if (!this.props.inProgress) {
      loadIndicatorClasses += ' hide';
      disabledAttribute = {};
    }

    return (
      <Modal dialogClassName="upload-file-modal" show={this.props.visible} onHide={this.closeModal}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Upload Attachment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={errorClasses}>{this.props.errorMessage}</div>
          <div>
            <form ref={node => this.uploadForm = node} className="form">
              <p>
                Select a file to upload as an attachment to this document. Uploading a file saves the document as a new
                revision.
              </p>
              <input ref={el => this.attachments = el} type="file" name="_attachments" {...disabledAttribute}/>
              <br />
            </form>

            <div className={loadIndicatorClasses}>
              <div className="bar" style={{ width: this.props.uploadPercentage + '%'}}></div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <a href="#" data-bypass="true" className="cancel-link" onClick={this.closeModal}>Cancel</a>
          <button href="#" id="upload-btn" data-bypass="true" className="btn btn-primary save" onClick={this.upload} {...disabledAttribute}>
            <i className="icon icon-upload" /> Upload Attachment
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}
