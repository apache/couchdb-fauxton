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
import {Table, Tooltip, OverlayTrigger} from "react-bootstrap";
import moment from 'moment';
import {ErrorModal} from './modals';
import {removeCredentialsFromUrl} from '../api';
import Helpers from '../../../helpers';

const getDbNameFromUrl = (urlObj, root) => {
  try {
    const urlWithoutDb = new URL(root);
    const dbName = urlObj.pathname.substring(urlWithoutDb.pathname.length);
    return encodeURIComponent(dbName);
  } catch (e) {
    return '';
  }
};

export const formatUrl = (url) => {
  let urlObj;
  let encoded;
  try {
    urlObj = new URL(removeCredentialsFromUrl(url));
  } catch (e) {
    return '';
  }
  const root = Helpers.getRootUrl();
  encoded = getDbNameFromUrl(urlObj, root);
  if (url.indexOf(window.location.hostname) > -1) {
    return (
      <span>
        {root}
        <a href={`#/database/${encoded}/_all_docs`}>{decodeURIComponent(encoded)}</a>
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
}

RowStatus.propTypes = {
  statusTime: PropTypes.any,
  status: PropTypes.string,
  errorMsg: PropTypes.string.isRequired,
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
          className="replication__row-btn icon-wrench replication__row-btn--no-left-pad"
          title={'Edit replication'}
          data-bypass="true"
        >
        </a>
      </li>
    );
    actions.push(
      <li className="replication__row-list" key={2}>
        <a
          className="replication__row-btn fonticon-document"
          title={'Edit replication document'}
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
        className={`replication__row-btn icon-trash ${onlyDeleteAction ? 'replication__row-btn--no-left-pad' : ''} `}
        title={`Delete ${onlyDeleteAction ? 'job' : 'document'} ${_id}`}
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
  _id: PropTypes.string.isRequired,
  url: PropTypes.string,
  error: PropTypes.bool.isRequired,
  errorMsg: PropTypes.string.isRequired,
  deleteDocs: PropTypes.func.isRequired
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
  onlyDeleteAction,
  showStateRow
}) => {
  let momentTime = moment(startTime);
  const formattedStartTime = momentTime.isValid() ? momentTime.format("MMM Do, h:mm a") : '';
  let stateRow = null;

  if (showStateRow) {
    stateRow = <RowStatus
      statusTime={statusTime}
      status={status}
      errorMsg={errorMsg}
    />;
  }

  return (
    <tr className="replication__table-row">
      <td className="replication__table-col"><input checked={selected} type="checkbox" onChange={() => selectDoc(_id)} /> </td>
      <td className="replication__table-col">{formatUrl(source)}</td>
      <td className="replication__table-col">{formatUrl(target)}</td>
      <td className="replication__table-col">{formattedStartTime}</td>
      <td className="replication__table-col">{type}</td>
      {stateRow}
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
  _id: PropTypes.string.isRequired,
  source: PropTypes.string.isRequired,
  target: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  status: PropTypes.string,
  url: PropTypes.string,
  statusTime: PropTypes.object.isRequired,
  startTime: PropTypes.object,
  selected: PropTypes.bool.isRequired,
  selectDoc: PropTypes.func.isRequired,
  errorMsg: PropTypes.string.isRequired,
  deleteDocs: PropTypes.func.isRequired,
  onlyDeleteAction: PropTypes.bool.isRequired,
  showStateRow: PropTypes.bool.isRequired
};

const BulkSelectHeader = ({isSelected, deleteDocs, someDocsSelected, onCheck}) => {
  const trash = someDocsSelected ?
    <button
      onClick={() => deleteDocs()}
      className="bulk-select-trash fonticon fonticon-trash"
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
  isSelected: PropTypes.bool.isRequired,
  someDocsSelected: PropTypes.bool.isRequired,
  onCheck: PropTypes.func.isRequired,
  deleteDocs: PropTypes.func.isRequired
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
    let orderChanged = false;
    const sorted = docs.sort((a, b) => {
      if (a[column] < b[column]) {
        orderChanged = true;
        return -1;
      }

      if (a[column] > b[column]) {
        orderChanged = true;
        return 1;
      }

      return 0;

    });

    if (!descending && orderChanged) {
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
        showStateRow={this.props.showStateRow}
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

  stateCol () {
    if (this.props.showStateRow) {
      return (
        <th className="replication__table-header-status" onClick={this.onSort('status')}>
          State
          <span className={`replication__table-header-icon ${this.iconDirection('status')} ${this.isSelected('status')}`} />
        </th>
      );
    }

    return null;
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
            {this.stateCol()}
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
  onlyDeleteAction: false,
  showStateRow: true
};
