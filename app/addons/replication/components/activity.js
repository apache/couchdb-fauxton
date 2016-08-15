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
import {Table} from "react-bootstrap";
import moment from 'moment';
import app from '../../../app';
import {DeleteModal, ErrorModal} from './modals';

const formatUrl = (url) => {
  const urlObj = new URL(url);
  const encoded = encodeURIComponent(urlObj.pathname.slice(1));

  if (url.indexOf(window.location.hostname) > -1) {
    return (
      <span>
        {urlObj.origin}
        <a href={`#/database/${encoded}/_all_docs`}>{urlObj.pathname}</a>
      </span>
    );
  }

  return `${urlObj.origin}${urlObj.pathname}`;
};

class RowActions extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  showModal () {
    this.setState({modalVisible: true});
  }

  closeModal () {
    this.setState({modalVisible: false});
  }

  getErrorIcon () {
    if (!this.props.error) {
      return null;
    }
    return (
      <li className="replication_row-list">
        <a
          data-bypass="true"
          className="replication_row-btn replication_row-btn--warning icon-exclamation-sign"
          onClick={this.showModal.bind(this)}
          title="View error message">
        </a>
        <ErrorModal
          onClick={this.closeModal.bind(this)}
          onClose={this.closeModal.bind(this)}
          errorMsg={this.props.errorMsg}
          visible={this.state.modalVisible}
        />
      </li>
    );
  }

  render () {
    const {_id, url, deleteDocs} = this.props;
    const errorIcon = this.getErrorIcon();
    return (
      <ul className="replication_row-actions-list">
        <li className="replication_row-list">
          <a
            href={`#replication/id/${encodeURIComponent(_id)}`}
            className="replication_row-btn icon-wrench"
            title={`Edit replication`}
            data-bypass="true"
            >
          </a>
        </li>
        <li className="replication_row-list">
        <a
          className="replication_row-btn fonticon-document"
          title={`Edit replication document`}
          href={url}
          data-bypass="true"
          >
        </a>
        </li>
        <li className="replication_row-list">
        <a
          className="replication_row-btn icon-trash"
          title={`Delete document ${_id}`}
          onClick={() => deleteDocs(_id)}>
        </a>
        </li>
        {errorIcon}
      </ul>
    );

  }
};

RowActions.propTypes = {
  _id: React.PropTypes.string.isRequired,
  url: React.PropTypes.string.isRequired,
  error: React.PropTypes.bool.isRequired,
  errorMsg: React.PropTypes.string.isRequired,
  deleteDocs: React.PropTypes.func.isRequired
};

const Row = ({
  _id,
  source,
  target,
  type,
  status,
  statusTime,
  url,
  selected,
  selectDoc,
  errorMsg,
  deleteDocs
}) => {
  const momentTime = moment(statusTime);
  const formattedTime = momentTime.isValid() ? momentTime.format("MMM Do, h:mm a") : '';

  return (
    <tr className="replication_table-row">
      <td className="replication_table-col"><input checked={selected} type="checkbox" onChange={() => selectDoc(_id)} /> </td>
      <td className="replication_table-col">{formatUrl(source)}</td>
      <td className="replication_table-col">{formatUrl(target)}</td>
      <td className="replication_table-col">{type}</td>
      <td className={`replication-row-status replication_row-status--${status}`}>{status}</td>
      <td className="replication_table-col">{formattedTime}</td>
      <td className="replication_table-col">
        <RowActions
          deleteDocs={deleteDocs}
          _id={_id}
          url={url}
          error={status === "error"}
          errorMsg={errorMsg}
          />
      </td>
    </tr>

  );
};

Row.propTypes = {
  _id: React.PropTypes.string.isRequired,
  source: React.PropTypes.string.isRequired,
  target: React.PropTypes.string.isRequired,
  type: React.PropTypes.string.isRequired,
  status: React.PropTypes.string,
  url: React.PropTypes.string.isRequired,
  statusTime: React.PropTypes.object.isRequired,
  selected: React.PropTypes.bool.isRequired,
  selectDoc: React.PropTypes.func.isRequired,
  errorMsg: React.PropTypes.string.isRequired,
  deleteDocs: React.PropTypes.func.isRequired
};

const BulkSelectHeader = ({isSelected, deleteDocs, someDocsSelected, onCheck}) => {
  const trash = someDocsSelected ?
    <button
      onClick={() => deleteDocs()}
      className="replication_bulk-select-trash fonticon fonticon-trash"
      title="Delete all selected">
    </button> : null;

  return (
    <div className="replication_bulk-select-wrapper">
      <div className="replication_bulk-select-header">
        <input className="replication_bulk-select-input" checked={isSelected} type="checkbox" onChange={onCheck} />
      </div>
    {trash}
    </div>
  );
};

BulkSelectHeader.propTypes = {
  isSelected: React.PropTypes.bool.isRequired,
  someDocsSelected: React.PropTypes.bool.isRequired,
  onCheck: React.PropTypes.func.isRequired,
  deleteDocs: React.PropTypes.func.isRequired
};

class ReplicationTable extends React.Component {
  constructor (props) {
    super(props);
    // this.state = {
    //   descending: false,
    //   column: 'statusTime'
    // };
  }

  sort(column, descending, docs) {
    const sorted = docs.sort((a, b) => {
      if (a[column] < b[column]) {
        return -1;
      }

      if (a[column] > b[column]) {
        return 1;
      }

      return 0;

    });

    if (!descending) {
      sorted.reverse();
    }

    return sorted;
  }

  renderRows () {
    return this.sort(this.props.column, this.props.descending, this.props.docs).map((doc, i) => {
      return <Row
        key={i}
        _id={doc._id}
        selected={doc.selected}
        selectDoc={this.props.selectDoc}
        source={doc.source}
        target={doc.target}
        type={doc.continuous === true ? 'Continuous' : 'One time'}
        status={doc.status}
        statusTime={doc.statusTime}
        url={doc.url}
        deleteDocs={this.props.deleteDocs}
        errorMsg={doc.errorMsg}
        doc={doc}
      />;
    });
  }

  iconDirection (column) {
    if (column === this.props.column && !this.props.descending) {
      return 'fonticon-up-dir';
    }

    return 'fonticon-down-dir';
  }

  onSort (column) {
    return (e) => {
      this.props.changeSort({
        descending: column === this.props.column ? !this.props.descending : true,
        column
      });
    };
  }

  isSelected (header) {
    if (header === this.props.column) {
      return 'replication_table--selected';
    }

    return '';
  }

  render () {
    return (
      <Table striped>
        <thead>
          <tr>
            <th className="replication_table-bulk-select">
              <BulkSelectHeader
                isSelected={this.props.allDocsSelected}
                onCheck={this.props.selectAllDocs}
                someDocsSelected={this.props.someDocsSelected}
                deleteDocs={this.props.deleteDocs}
                />
            </th>
            <th className="replication_table-header-source" onClick={this.onSort('source')}>
              Source
              <span className={`replication_table-header-icon ${this.iconDirection('source')} ${this.isSelected('source')}`} />
            </th>
            <th className="replication_table-header-target" onClick={this.onSort('target')}>
              Target
              <span className={`replication_table-header-icon ${this.iconDirection('target')} ${this.isSelected('target')}`} />
            </th>
            <th className="replication_table-header-type" onClick={this.onSort('continuous')}>
              Type
              <span className={`replication_table-header-icon ${this.iconDirection('continuous')} ${this.isSelected('continuous')}`} />
            </th>
            <th className="replication_table-header-status" onClick={this.onSort('status')}>
              State
              <span className={`replication_table-header-icon ${this.iconDirection('status')} ${this.isSelected('status')}`} />
            </th>
            <th className="replication_table-header-time" onClick={this.onSort('statusTime')}>
              State Time
              <span className={`replication_table-header-icon ${this.iconDirection('statusTime')} ${this.isSelected('statusTime')}`} />
            </th>
            <th className="replication_table-header-actions">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {this.renderRows()}
        </tbody>
      </Table>
    );
  }
}

const ReplicationFilter = ({value, onChange}) => {
  return (
    <div className="replication_filter">
      <i className="replication_filter-icon fonticon-filter" />
      <input
        type="text"
        placeholder="Filter replications"
        className="replication_filter-input"
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

const ReplicationHeader = ({filter, onFilterChange}) => {
  return (
    <div className="replication_activity_header">
      <div></div>
      <ReplicationFilter value={filter} onChange={onFilterChange} />
      <a href="#/replication/create" className="btn save replication_activity_header-btn btn-success">
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

export default class Activity extends React.Component {
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
    const {
      onFilterChange,
      activitySort,
      changeActivitySort,
      docs,
      filter,
      selectAllDocs,
      someDocsSelected,
      allDocsSelected,
      selectDoc
    } = this.props;

    const {modalVisible} = this.state;
    return (
      <div className="replication_activity">
        <ReplicationHeader
          filter={filter}
          onFilterChange={onFilterChange}
        />
        <ReplicationTable
          someDocsSelected={someDocsSelected}
          allDocsSelected={allDocsSelected}
          selectAllDocs={selectAllDocs}
          docs={docs}
          selectDoc={selectDoc}
          deleteDocs={this.showModal.bind(this)}
          descending={activitySort.descending}
          column={activitySort.column}
          changeSort={changeActivitySort}
        />
        <DeleteModal
          multipleDocs={this.numDocsSelected()}
          visible={modalVisible}
          onClose={this.closeModal.bind(this)}
          onClick={this.confirmDeleteDocs.bind(this)}
          />
      </div>
    );
  }
}

Activity.propTypes = {
  docs: React.PropTypes.array.isRequired,
  filter: React.PropTypes.string.isRequired,
  selectAllDocs: React.PropTypes.func.isRequired,
  allDocsSelected: React.PropTypes.bool.isRequired,
  someDocsSelected: React.PropTypes.bool.isRequired,
  selectDoc: React.PropTypes.func.isRequired,
  onFilterChange: React.PropTypes.func.isRequired,
  deleteDocs: React.PropTypes.func.isRequired,
  activitySort: React.PropTypes.object.isRequired,
  changeActivitySort: React.PropTypes.func.isRequired
};
