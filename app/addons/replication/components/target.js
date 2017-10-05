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
import RemoteExample from './remoteexample';

const { StyledSelect } = Components;

const replicationTargetSourceOptions = () => {
  return [
    { value: '', label: 'Select target' },
    { value: Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE, label: 'Existing local database' },
    { value: Constants.REPLICATION_TARGET.EXISTING_REMOTE_DATABASE, label: 'Existing remote database' },
    { value: Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE, label: 'New local database' },
    { value: Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE, label: 'New remote database' }
  ].map((option) => {
    return (
      <option value={option.value} key={option.value}>{option.label}</option>
    );
  });
};

const ReplicationTargetSelect = ({value, onChange}) => {
  return (
    <div className="replication__section">
      <div className="replication__input-label">
        Replication Target:
      </div>
      <div id="replication-target" className="replication__input-select">
        <StyledSelect
          selectContent={replicationTargetSourceOptions()}
          selectChange={(e) => onChange(e.target.value)}
          selectId="replication-target"
          selectValue={value} />
      </div>
    </div>
  );
};

ReplicationTargetSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

const RemoteTargetReplicationRow = ({onChange, value, newRemote}) => {
  return (
    <div>
      <input
        type="text"
        className="replication__remote-connection-url"
        placeholder="https://"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    <RemoteExample newRemote={newRemote} />
    </div>
  );
};

RemoteTargetReplicationRow.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

const ExistingLocalTargetReplicationRow = ({onChange, value, databases}) => {
  const options = databases.map(db => ({value: db, label: db}));
  return (
    <div id="replication-target-local" className="replication__input-react-select">
      <ReactSelect
        value={value}
        options={options}
        placeholder="Database name"
        clearable={false}
        onChange={({value}) => onChange(value)}
      />
    </div>
  );
};

ExistingLocalTargetReplicationRow.propTypes = {
  value: PropTypes.string.isRequired,
  databases: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

const NewLocalTargetReplicationRow = ({onChange, value}) =>
  <input
    type="text"
    className="replication__new-input"
    placeholder="Database name"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />;

NewLocalTargetReplicationRow.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

const ReplicationTargetRow = ({
  replicationTarget,
  onLocalTargetChange,
  onRemoteTargetChange,
  localTarget,
  remoteTarget,
  databases
}) => {
  if (!replicationTarget) {
    return null;
  }
  let input;

  if (replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE) {
    targetLabel = 'New Database:';
    input = <NewLocalTargetReplicationRow
      value={localTarget}
      onChange={onLocalTargetChange}
            />;
  } else if (replicationTarget === Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE) {
    input = <ExistingLocalTargetReplicationRow
      onChange={onLocalTargetChange}
      databases={databases}
      value={localTarget}
            />;
  } else {
    input = <RemoteTargetReplicationRow
      onChange={onRemoteTargetChange}
      value={remoteTarget}
      newRemote={Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE === replicationTarget}
            />;
  }

  let targetLabel = 'Target Name:';

  if (replicationTarget === Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE ||
      replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE) {
    targetLabel = 'New Database:';
  }

  return (
    <div className="replication__section">
      <div className="replication__input-label">{targetLabel}</div>
      <div>
        {input}
      </div>
    </div>
  );
};

ReplicationTargetRow.propTypes = {
  databases: PropTypes.array.isRequired,
  onLocalTargetChange: PropTypes.func.isRequired,
  onRemoteTargetChange: PropTypes.func.isRequired,
  remoteTarget: PropTypes.string.isRequired,
  localTarget: PropTypes.string.isRequired,
  replicationTarget: PropTypes.string.isRequired
};

export class ReplicationTarget extends React.Component {

  render () {
    const {
      replicationTarget,
      onLocalTargetChange,
      onTargetChange,
      databases,
      localTarget,
      onRemoteTargetChange,
      remoteTarget
    } = this.props;
    return (
      <div>
        <ReplicationTargetSelect
          value={replicationTarget}
          onChange={onTargetChange}
        />
        <ReplicationTargetRow
          remoteTarget={remoteTarget}
          replicationTarget={replicationTarget}
          databases={databases}
          localTarget={localTarget}
          onRemoteTargetChange={onRemoteTargetChange}
          onLocalTargetChange={onLocalTargetChange}
        />
      </div>
    );
  }
}

ReplicationTarget.propTypes = {
  databases: PropTypes.array.isRequired,
  onTargetChange: PropTypes.func.isRequired,
  onLocalTargetChange: PropTypes.func.isRequired,
  onRemoteTargetChange: PropTypes.func.isRequired,
  remoteTarget: PropTypes.string.isRequired,
  localTarget: PropTypes.string.isRequired,
  replicationTarget: PropTypes.string.isRequired
};
