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

import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Constants from '../constants';
import Components from '../../components/react-components';
import ReactSelect from 'react-select';

const { StyledSelect } = Components;

const replicationTargetSourceOptions = () => {
  return [
    { value: '', label: 'Select target type' },
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

const ReplicationTargetSelect = ({ value, onChange }) => {
  return (
    <div className="replication__section">
      <div className="replication__input-label">
        Type:
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

const RemoteTargetReplicationRow = ({ onChange, value }) => {
  return (
    <div>
      <input
        type="text"
        className="replication__remote-connection-url"
        placeholder="https://"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

RemoteTargetReplicationRow.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

const ExistingLocalTargetReplicationRow = ({ onChange, value, databases }) => {
  const options = databases.map(db => ({ value: db, label: db }));
  return (
    <div id="replication-target-local" className="replication__input-react-select">
      <ReactSelect
        value={value}
        options={options}
        placeholder="Database name"
        clearable={false}
        onChange={({ value }) => onChange(value)}
      />
    </div>
  );
};

ExistingLocalTargetReplicationRow.propTypes = {
  value: PropTypes.string.isRequired,
  databases: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

const NewLocalTargetReplicationRow = ({ onChange, value }) =>
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
    targetLabel = 'New database:';
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

  let targetLabel = 'Name:';

  if (replicationTarget === Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE ||
    replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE) {
    targetLabel = 'New database:';
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

const NewTargetDatabaseOptionsRow = ({
  replicationTarget,
  targetDatabasePartitioned,
  onTargetDatabasePartitionedChange,
  allowNewPartitionedLocalDbs
}) => {
  if (!replicationTarget) {
    return null;
  }

  if (replicationTarget !== Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE &&
    replicationTarget !== Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE) {
    return null;
  }

  const disablePartitionedOption = replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE &&
    !allowNewPartitionedLocalDbs;
  let msg = disablePartitionedOption ? "Local server does not support partitioned databases" :
    "Creates a new partitioned database";
  const tooltip = <Tooltip id="new-db-partitioned-tooltip">{msg}</Tooltip>;
  const togglePartitioned = () => {
    onTargetDatabasePartitionedChange(!targetDatabasePartitioned);
  };

  return (
    <div className="replication__section">
      <div className="replication__input-label">New database options:</div>
      <div className={classnames('replication__input-checkbox', { 'replication__input-checkbox--disabled': disablePartitionedOption})}>

        <input id="target-db-is-partitioned"
          type="checkbox"
          value="true"
          checked={targetDatabasePartitioned}
          onChange={togglePartitioned}
          disabled={disablePartitionedOption}
        />


        <OverlayTrigger placement="right" overlay={tooltip}>
          <label htmlFor="target-db-is-partitioned" >Partitioned</label>
        </OverlayTrigger>
      </div >
    </div>
  );
};

NewTargetDatabaseOptionsRow.propTypes = {
  onTargetDatabasePartitionedChange: PropTypes.func.isRequired,
  targetDatabasePartitioned: PropTypes.bool.isRequired,
  replicationTarget: PropTypes.string.isRequired,
  allowNewPartitionedLocalDbs: PropTypes.bool.isRequired
};

export class ReplicationTarget extends React.Component {

  render() {
    const {
      replicationTarget,
      onLocalTargetChange,
      onTargetChange,
      databases,
      localTarget,
      onRemoteTargetChange,
      remoteTarget,
      targetDatabasePartitioned,
      onTargetDatabasePartitionedChange,
      allowNewPartitionedLocalDbs
    } = this.props;
    return (
      <div>
        <h3>Target</h3>
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
        <NewTargetDatabaseOptionsRow
          replicationTarget={replicationTarget}
          onTargetDatabasePartitionedChange={onTargetDatabasePartitionedChange}
          targetDatabasePartitioned={targetDatabasePartitioned}
          allowNewPartitionedLocalDbs={allowNewPartitionedLocalDbs}
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
