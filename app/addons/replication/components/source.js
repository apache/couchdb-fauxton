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
import Constants from '../constants';
import Form from 'react-bootstrap/Form';

const RemoteSourceInput = ({onChange, value}) => {
  return (
    <div className="row mt-2">
      <div className="col-12 col-md-2">Database URL:</div>
      <div className="col-12 col-md mt-1 mt-md-0">
        <Form.Control
          id="replication-remote-connection-url"
          type="text"
          className="form-control"
          placeholder="https://"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

RemoteSourceInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

const LocalSourceInput = ({value, onChange, databases}) => {
  const options = databases.map(option => <option value={option} key={option}>{option}</option>);
  return (
    <div className="row mt-2">
      <div className="col-12 col-md-2">Name:</div>
      <div className="col-12 col-md mt-1 mt-md-0">
        <Form.Select
          id="replication-source-local-database-select"
          value={value}
          placeholder="Database name"
          onChange={(e) => onChange(e.target.value)}
        >
          {options}
        </Form.Select>
      </div>
    </div>
  );
};

LocalSourceInput.propTypes = {
  value: PropTypes.string.isRequired,
  databases: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

const ReplicationSourceRow = ({replicationSource, databases, localSource, remoteSource, onChangeRemote, onChangeLocal}) => {
  if (replicationSource === Constants.REPLICATION_SOURCE.LOCAL) {
    return <LocalSourceInput
      value={localSource}
      databases={databases}
      onChange={onChangeLocal}
    />;
  }

  return <RemoteSourceInput value={remoteSource} onChange={onChangeRemote} />;
};

ReplicationSourceRow.propTypes = {
  replicationSource: PropTypes.string.isRequired,
  databases: PropTypes.array.isRequired,
  localSource: PropTypes.string.isRequired,
  remoteSource: PropTypes.string.isRequired,
  onChangeRemote: PropTypes.func.isRequired,
  onChangeLocal: PropTypes.func.isRequired
};

const replicationSourceSelectOptions = () => {
  return [
    { value: '', label: 'Select source type' },
    { value: Constants.REPLICATION_SOURCE.LOCAL, label: 'Local database' },
    { value: Constants.REPLICATION_SOURCE.REMOTE, label: 'Remote database' }
  ].map((option) => {
    return (
      <option value={option.value} key={option.value}>{option.label}</option>
    );
  });
};

export const ReplicationSourceSelect = ({onChange, value}) => {

  return (
    <div className="row">
      <div className="col-12 col-md-2">Type:</div>
      <div className="col-12 col-md mt-1 mt-md-0">
        <Form.Select
          onChange={(e) => onChange(e.target.value)}
          id="replication-source"
          value={value}
        >
          {replicationSourceSelectOptions()}
        </Form.Select>
      </div>
    </div>
  );
};

ReplicationSourceSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export class ReplicationSource extends React.Component {

  getReplicationSourceRow () {
    const {
      replicationSource,
      localSource,
      onLocalSourceChange,
      onRemoteSourceChange,
      remoteSource,
      databases
    } = this.props;

    if (!replicationSource) {
      return null;
    }

    return <ReplicationSourceRow
      replicationSource={replicationSource}
      databases={databases}
      localSource={localSource}
      remoteSource={remoteSource}
      onChangeLocal={onLocalSourceChange}
      onChangeRemote={onRemoteSourceChange}
    />;
  }

  render () {
    const {replicationSource, onSourceSelect} = this.props;
    return (
      <React.Fragment>
        <ReplicationSourceSelect
          onChange={onSourceSelect}
          value={replicationSource}
        />
        {this.getReplicationSourceRow()}
      </React.Fragment>
    );
  }
}

ReplicationSource.propTypes = {
  replicationSource: PropTypes.string.isRequired,
  localSource: PropTypes.string.isRequired,
  remoteSource: PropTypes.string.isRequired,
  databases: PropTypes.array.isRequired,
  onLocalSourceChange: PropTypes.func.isRequired,
  onRemoteSourceChange: PropTypes.func.isRequired
};
