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
import {Table, Tooltip, OverlayTrigger} from "react-bootstrap";
import moment from 'moment';
import {ErrorModal} from './modals';

const formatUrl = (url) => {
  const urlObj = new URL(url);
  const encoded = encodeURIComponent(urlObj.pathname.slice(1));

  if (url.indexOf(window.location.hostname) > -1) {
    return (
      <span>
        {urlObj.origin + '/'}
        <a href={`#/database/${encoded}/_all_docs`}>{urlObj.pathname.slice(1)}</a>
      </span>
    );
  }

  return `${urlObj.origin}${urlObj.pathname}`;
};

class RowStatus extends React.Component {
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
    const {status} = this.props;
    if (status !== 'error' && status !== 'retrying') {
      return null;
    }

    return (
      <span>
        <a
          data-bypass="true"
          className="replication__row-btn replication__row-btn--warning icon-exclamation-sign"
          onClick={this.showModal.bind(this)}
          title="View error message">
        </a>
        <ErrorModal
          onClick={this.closeModal.bind(this)}
          onClose={this.closeModal.bind(this)}
          errorMsg={this.props.errorMsg}
          visible={this.state.modalVisible}
          status={status}
        />
      </span>
    );
  }

  render () {
    const {statusTime, status} = this.props;
    let momentTime = moment(statusTime);
    let statusValue = <span>{status}</span>;

    if (momentTime.isValid()) {
      const formattedStatusTime = momentTime.format("MMM Do, h:mm a");
      const stateTimeTooltip = <Tooltip id="">Last updated: {formattedStatusTime}</Tooltip>;
      statusValue =
        <OverlayTrigger placement="top" overlay={stateTimeTooltip}>
          <span>{status}</span>
        </OverlayTrigger>;
    }

    return (
      <td className={`replication__row-status replication__row-status--${status}`}>
        {statusValue}
        {this.getErrorIcon()}
      </td>
    );
  }
};

RowStatus.propTypes = {
  statusTime: React.PropTypes.any,
  status: React.PropTypes.string,
  errorMsg: React.PropTypes.string.isRequired,
};

RowStatus.defaultProps = {
  status: ''
};

const RowActions = ({onlyDeleteAction, _id, url, deleteDocs}) => {
  const actions = [];
  if (!onlyDeleteAction) {
    actions.push(
      <li className="replication__row-list" key={1}>
        <a
          href={`#replication/id/${encodeURIComponent(_id)}`}
          className="replication__row-btn icon-wrench"
          title={`Edit replication`}
          data-bypass="true"
          >
        </a>
      </li>
    );
    actions.push(
      <li className="replication__row-list" key={2}>
        <a
          className="replication__row-btn fonticon-document"
          title={`Edit replication document`}
          href={url}
          data-bypass="true"
          >
        </a>
      </li>
    );
  }

  actions.push(
    <li className="replication__row-list" key={3}>
      <a
        className="replication__row-btn icon-trash"
        title={`Delete document ${_id}`}
        onClick={() => deleteDocs(_id)}>
      </a>
    </li>
  );

  return (
    <ul className="replication__row-actions-list">
      {actions}
    </ul>
  );
};

RowActions.propTypes = {
  _id: React.PropTypes.string.isRequired,
  url: React.PropTypes.string,
  error: React.PropTypes.bool.isRequired,
  errorMsg: React.PropTypes.string.isRequired,
  deleteDocs: React.PropTypes.func.isRequired
};

const Row = ({
  _id,
  source,
  target,
  type,
  startTime,
  status,
  statusTime,
  url,
  selected,
  selectDoc,
  errorMsg,
  deleteDocs,
  onlyDeleteAction
}) => {
  let momentTime = moment(startTime);
  const formattedStartTime = momentTime.isValid() ? momentTime.format("MMM Do, h:mm a") : '';

  return (
    <tr className="replication__table-row">
      <td className="replication__table-col"><input checked={selected} type="checkbox" onChange={() => selectDoc(_id)} /> </td>
      <td className="replication__table-col">{formatUrl(source)}</td>
      <td className="replication__table-col">{formatUrl(target)}</td>
      <td className="replication__table-col">{formattedStartTime}</td>
      <td className="replication__table-col">{type}</td>
      <RowStatus
        statusTime={statusTime}
        status={status}
        errorMsg={errorMsg}
      />
      <td className="replication__table-col">
        <RowActions
          onlyDeleteAction={onlyDeleteAction}
          deleteDocs={deleteDocs}
          _id={_id}
          url={url}
          error={status === "error" || status === 'retrying'}
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
  url: React.PropTypes.string,
  statusTime: React.PropTypes.object.isRequired,
  startTime: React.PropTypes.object,
  selected: React.PropTypes.bool.isRequired,
  selectDoc: React.PropTypes.func.isRequired,
  errorMsg: React.PropTypes.string.isRequired,
  deleteDocs: React.PropTypes.func.isRequired,
  onlyDeleteAction: React.PropTypes.bool.isRequired
};

const BulkSelectHeader = ({isSelected, deleteDocs, someDocsSelected, onCheck}) => {
  const trash = someDocsSelected ?
    <button
      onClick={() => deleteDocs()}
      className="replication__bulk-select-trash fonticon fonticon-trash"
      title="Delete all selected">
    </button> : null;

  return (
    <div className="replication__bulk-select-wrapper">
      <div className="replication__bulk-select-header">
        <input className="replication__bulk-select-input" checked={isSelected} type="checkbox" onChange={onCheck} />
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

const EmptyRow = ({msg}) => {
  return (
    <tr>
      <td colSpan="7" className="replication__empty-row">
        {msg}
      </td>
    </tr>
  );
};

EmptyRow.defaultProps = {
  msg: "There is no replicator-db activity or history to display."
};


export class ReplicationTable extends React.Component {
  constructor (props) {
    super(props);
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
    if (this.props.docs.length === 0) {
      return <EmptyRow />;
    }

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
        startTime={doc.startTime}
        url={doc.url}
        deleteDocs={this.props.deleteDocs}
        errorMsg={doc.errorMsg}
        doc={doc}
        onlyDeleteAction={this.props.onlyDeleteAction}
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
    return () => {
      this.props.changeSort({
        descending: column === this.props.column ? !this.props.descending : true,
        column
      });
    };
  }

  isSelected (header) {
    if (header === this.props.column) {
      return 'replication__table--selected';
    }

    return '';
  }

  render () {
    return (
      <Table striped>
        <thead>
          <tr>
            <th className="replication__table-bulk-select">
              <BulkSelectHeader
                isSelected={this.props.allDocsSelected}
                onCheck={this.props.selectAllDocs}
                someDocsSelected={this.props.someDocsSelected}
                deleteDocs={this.props.deleteDocs}
                />
            </th>
            <th className="replication__table-header-source" onClick={this.onSort('source')}>
              Source
              <span className={`replication__table-header-icon ${this.iconDirection('source')} ${this.isSelected('source')}`} />
            </th>
            <th className="replication__table-header-target" onClick={this.onSort('target')}>
              Target
              <span className={`replication__table-header-icon ${this.iconDirection('target')} ${this.isSelected('target')}`} />
            </th>
            <th className="replication__table-header-time" onClick={this.onSort('statusTime')}>
              Start Time
              <span className={`replication__table-header-icon ${this.iconDirection('statusTime')} ${this.isSelected('statusTime')}`} />
            </th>
            <th className="replication__table-header-type" onClick={this.onSort('continuous')}>
              Type
              <span className={`replication__table-header-icon ${this.iconDirection('continuous')} ${this.isSelected('continuous')}`} />
            </th>
            <th className="replication__table-header-status" onClick={this.onSort('status')}>
              State
              <span className={`replication__table-header-icon ${this.iconDirection('status')} ${this.isSelected('status')}`} />
            </th>
            <th className="replication__table-header-actions">
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

ReplicationTable.defaultProps = {
  onlyDeleteAction: false
};
