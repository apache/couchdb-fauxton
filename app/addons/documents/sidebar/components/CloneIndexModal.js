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
import { Button, Modal } from 'react-bootstrap';
import FauxtonAPI from '../../../../core/api';
import IndexEditorComponents from '../../index-editor/components';

const { DesignDocSelector } = IndexEditorComponents;

export default class CloneIndexModal extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    title: PropTypes.string,
    close: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    designDocArray: PropTypes.array.isRequired,
    selectedDesignDoc: PropTypes.string.isRequired,
    newDesignDocName: PropTypes.string.isRequired,
    newIndexName: PropTypes.string.isRequired,
    indexLabel: PropTypes.string.isRequired,
    selectDesignDoc: PropTypes.func.isRequired,
    updateNewDesignDocName: PropTypes.func.isRequired,
    setNewCloneIndexName: PropTypes.func.isRequired
  };

  static defaultProps = {
    title: 'Clone Index',
    visible: false
  };

  constructor(props) {
    super(props);
    this.props.setNewCloneIndexName('');
  }

  submit = () => {
    if (!this.designDocSelector.validate()) {
      return;
    }
    if (this.props.newIndexName === '') {
      FauxtonAPI.addNotification({
        msg: 'Please enter the new index name.',
        type: 'error',
        clear: true
      });
      return;
    }
    this.props.submit();
  };

  close = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.props.close();
  };

  setNewIndexName = (e) => {
    this.props.setNewCloneIndexName(e.target.value);
  };

  render() {
    return (
      <Modal dialogClassName="clone-index-modal" id="clone-index-modal" show={this.props.visible} onHide={this.close}>
        <Modal.Header closeButton={true}>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <form className="form" method="post" onSubmit={this.submit}>
            <p>
              Select the design document where the cloned {this.props.indexLabel} will be created, and then enter
              a name for the cloned {this.props.indexLabel}.
            </p>

            <DesignDocSelector
              ref={node => this.designDocSelector = node}
              designDocList={this.props.designDocArray}
              isDbPartitioned={this.props.isDbPartitioned}
              selectedDesignDocName={this.props.selectedDesignDoc}
              selectedDesignDocPartitioned={this.props.selectedDesignDocPartitioned}
              newDesignDocName={this.props.newDesignDocName}
              newDesignDocPartitioned={this.props.newDesignDocPartitioned}
              onSelectDesignDoc={this.props.selectDesignDoc}
              onChangeNewDesignDocName={this.props.updateNewDesignDocName}
              onChangeNewDesignDocPartitioned={this.props.updateNewDesignDocPartitioned}
              className="mb-3 col-12"
            />

            <div className="row pt-0">
              <div className="col-12">
                <label htmlFor="new-index-name" className="form-label mb-0 text-capitalize">{this.props.indexLabel} Name</label>
                <input type="text" placeholder={"New view name"} value={this.props.newIndexName} className="form-control" id="new-index-name" onChange={this.setNewIndexName} />
              </div>
            </div>
          </form>

        </Modal.Body>
        <Modal.Footer>
          <Button href="#" variant="cf-cancel" className="cancel-link" onClick={this.close} data-bypass="true">Cancel</Button>
          <Button onClick={this.submit} data-bypass="true" variant="cf-primary" className="save">
            <i className="icon fonticon-ok-circled" /> Clone {this.props.indexLabel}</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
