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
    <div className="replication-section">
      <div className="replication-input-label">
        Replication Target:
      </div>
      <div id="replication-target" className="replication-input-select">
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
  value: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired
};

const RemoteTargetReplicationRow = ({onChange, value}) => {
  return (
    <div>
      <input
        type="text"
        className="replication-remote-connection-url"
        placeholder="https://"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="replication-remote-connection-url-text">e.g. https://$REMOTE_USERNAME:$REMOTE_PASSWORD@$REMOTE_SERVER/$DATABASE</div>
    </div>
  );
};

RemoteTargetReplicationRow.propTypes = {
  value: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired
};

const ExistingLocalTargetReplicationRow = ({onChange, value, databases}) => {
  const options = databases.map(db => ({value: db, label: db}));
  return (
    <div id="replication-target-local" className="replication-input-react-select">
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
  value: React.PropTypes.string.isRequired,
  databases: React.PropTypes.array.isRequired,
  onChange: React.PropTypes.func.isRequired
};

const NewLocalTargetReplicationRow = ({onChange, value}) =>
  <input
    type="text"
    className="replication-new-input"
    placeholder="Database name"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />;

NewLocalTargetReplicationRow.propTypes = {
  value: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired
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
            />;
  }

  let targetLabel = 'Target Name:';

  if (replicationTarget === Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE ||
      replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE) {
    targetLabel = 'New Database:';
  }

  return (
    <div className="replication-section">
      <div className="replication-input-label">{targetLabel}</div>
      <div>
        {input}
      </div>
    </div>
  );
};

ReplicationTargetRow.propTypes = {
  databases: React.PropTypes.array.isRequired,
  onLocalTargetChange: React.PropTypes.func.isRequired,
  onRemoteTargetChange: React.PropTypes.func.isRequired,
  remoteTarget: React.PropTypes.string.isRequired,
  localTarget: React.PropTypes.string.isRequired,
  replicationTarget: React.PropTypes.string.isRequired
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
  databases: React.PropTypes.array.isRequired,
  onTargetChange: React.PropTypes.func.isRequired,
  onLocalTargetChange: React.PropTypes.func.isRequired,
  onRemoteTargetChange: React.PropTypes.func.isRequired,
  remoteTarget: React.PropTypes.string.isRequired,
  localTarget: React.PropTypes.string.isRequired,
  replicationTarget: React.PropTypes.string.isRequired
};
