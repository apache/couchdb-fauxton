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
import { Modal } from 'react-bootstrap';
import ReactDOM from 'react-dom';
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
      <Modal dialogClassName="clone-index-modal" show={this.props.visible} onHide={this.close}>
        <Modal.Header closeButton={true}>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <form className="form" method="post" onSubmit={this.submit}>
            <p>
              Select the design document where the cloned {this.props.indexLabel} will be created, and then enter
              a name for the cloned {this.props.indexLabel}.
            </p>

            <div className="row">
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
                onChangeNewDesignDocPartitioned={this.props.updateNewDesignDocPartitioned} />
            </div>

            <div className="clone-index-name-row">
              <label className="new-index-title-label" htmlFor="new-index-name">{this.props.indexLabel} Name</label>
              <input type="text" id="new-index-name" value={this.props.newIndexName} onChange={this.setNewIndexName}
                placeholder="New view name" />
            </div>
          </form>

        </Modal.Body>
        <Modal.Footer>
          <a href="#" className="cancel-link" onClick={this.close} data-bypass="true">Cancel</a>
          <button onClick={this.submit} data-bypass="true" className="btn btn-primary save">
            <i className="icon fonticon-ok-circled" /> Clone {this.props.indexLabel}</button>
        </Modal.Footer>
      </Modal>
    );
  }
}
