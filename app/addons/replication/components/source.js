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
import Constants from '../constants';
import Components from '../../components/react-components.react';
import ReactSelect from 'react-select';
import RemoteExample from './remoteexample';

const { StyledSelect } = Components;

const RemoteSourceInput = ({onChange, value}) =>
  <div className="replication-section">
    <div className="replication-input-label">Database URL:</div>
    <div className="">
      <input
        type="text"
        className="replication-remote-connection-url"
        placeholder="https://"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    <RemoteExample />
    </div>
  </div>;

RemoteSourceInput.propTypes = {
  value: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired
};

const LocalSourceInput = ({value, onChange, databases}) => {
  const options = databases.map(db => ({value: db, label: db}));
  return (
    <div className="replication-section">
      <div className="replication-input-label">
        Source Name:
      </div>
      <div className="replication-input-react-select">
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
  value: React.PropTypes.string.isRequired,
  databases: React.PropTypes.array.isRequired,
  onChange: React.PropTypes.func.isRequired
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
  replicationSource: React.PropTypes.string.isRequired,
  databases: React.PropTypes.array.isRequired,
  localSource: React.PropTypes.string.isRequired,
  remoteSource: React.PropTypes.string.isRequired,
  onChangeRemote: React.PropTypes.func.isRequired,
  onChangeLocal: React.PropTypes.func.isRequired
};

const replicationSourceSelectOptions = () => {
  return [
    { value: '', label: 'Select source' },
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
    <div className="replication-section">
      <div className="replication-input-label">
        Replication Source:
      </div>
      <div className="replication-input-select">
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
  value: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired
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
    const {replicationSource, onSourceSelect, localSource, remoteSource, databases} = this.props;
    const Actions = {};
    return (
      <div>
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
  replicationSource: React.PropTypes.string.isRequired,
  localSource: React.PropTypes.string.isRequired,
  remoteSource: React.PropTypes.string.isRequired,
  databases: React.PropTypes.array.isRequired,
  onLocalSourceChange: React.PropTypes.func.isRequired,
  onRemoteSourceChange: React.PropTypes.func.isRequired
};
