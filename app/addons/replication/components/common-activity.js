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
import {DeleteModal} from './modals';

export class BulkDeleteController extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      modalVisible: false,
      unconfirmedDeleteDocId: null
    };
  }

  closeModal () {
    this.setState({
      modalVisible: false,
      unconfirmedDeleteDocId: null
    });
  }

  showModal (doc) {
    this.setState({
      modalVisible: true,
      unconfirmedDeleteDocId: doc
    });
  }

  confirmDeleteDocs () {
    let docs = [];
    if (this.state.unconfirmedDeleteDocId) {
      const doc = this.props.docs.find(doc => doc._id === this.state.unconfirmedDeleteDocId);
      docs.push(doc);
    } else {
      docs = this.props.docs.filter(doc => doc.selected);
    }

    this.props.deleteDocs(docs);
    this.closeModal();
  }

  numDocsSelected () {
    return this.props.docs.filter(doc => doc.selected).length;
  }

  render () {
    const {modalVisible} = this.state;
    return <DeleteModal
          multipleDocs={this.numDocsSelected()}
          visible={modalVisible}
          onClose={this.closeModal.bind(this)}
          onClick={this.confirmDeleteDocs.bind(this)}
          />;
  }
}

BulkDeleteController.propTypes = {
  docs: React.PropTypes.array.isRequired,
  deleteDocs: React.PropTypes.func.isRequired
};

export const ReplicationFilter = ({value, onChange}) => {
  return (
    <div className="replication__filter">
      <i className="replication__filter-icon fonticon-filter" />
      <input
        type="text"
        placeholder="Filter replications"
        className="replication__filter-input"
        value={value}
        onChange={(e) => {onChange(e.target.value);}}
      />
    </div>
  );
};

ReplicationFilter.propTypes = {
  value: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired
};

export const ReplicationHeader = ({filter, onFilterChange}) => {
  return (
    <div className="replication__activity_header">
      <div></div>
      <ReplicationFilter value={filter} onChange={onFilterChange} />
      <a href="#/replication/_create" className="btn save replication__activity_header-btn btn-success">
        <i className="icon fonticon-plus-circled"></i>
        New Replication
      </a>
    </div>
  );
};

ReplicationHeader.propTypes = {
  filter: React.PropTypes.string.isRequired,
  onFilterChange: React.PropTypes.func.isRequired
};
