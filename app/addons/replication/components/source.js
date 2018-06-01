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
import Components from '../../components/react-components';
import ReactSelect from 'react-select';

const { StyledSelect } = Components;

const RemoteSourceInput = ({onChange, value}) =>
  <div className="replication__section">
    <div className="replication__input-label">Database URL:</div>
    <div className="">
      <input
        type="text"
        className="replication__remote-connection-url"
        placeholder="https://"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>;

RemoteSourceInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

const LocalSourceInput = ({value, onChange, databases}) => {
  const options = databases.map(db => ({value: db, label: db}));
  return (
    <div className="replication__section">
      <div className="replication__input-label">
        Name:
      </div>
      <div className="replication__input-react-select">
        <ReactSelect
          name="source-name"
          value={value}
          placeholder="Database name"
          options={options}
          clearable={false}
          onChange={({value}) => onChange(value)} />
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
    <div className="replication__section">
      <div className="replication__input-label">
        Type:
      </div>
      <div className="replication__input-select">
        <StyledSelect
          selectContent={replicationSourceSelectOptions()}
          selectChange={(e) => onChange(e.target.value)}
          selectId="replication-source"
          selectValue={value} />
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
      <div>
        <h3>Source</h3>
        <ReplicationSourceSelect
          onChange={onSourceSelect}
          value={replicationSource}
        />
        {this.getReplicationSourceRow()}
      </div>
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
