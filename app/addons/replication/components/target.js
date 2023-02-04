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
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Constants from '../constants';
import Form from 'react-bootstrap/Form';

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
    <div className="row">
      <div className="col-12 col-md-2">Type:</div>
      <div className="col-12 col-md mt-1 mt-md-0">
        <Form.Select
          onChange={(e) => onChange(e.target.value)}
          id="replication-target"
          value={value}
        >
          {replicationTargetSourceOptions()}
        </Form.Select>
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
    <Form.Control
      type="text"
      id="replication-remote-connection-url"
      className="form-control"
      placeholder="https://"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

RemoteTargetReplicationRow.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

const ExistingLocalTargetReplicationRow = ({ onChange, value, databases }) => {
  const options = databases.map(option => <option value={option} key={option}>{option}</option>);
  return (
    <Form.Select
      id="replication-target-existing-local-database-database-name"
      value={value}
      placeholder="Database name"
      onChange={(e) => onChange(e.target.value)}
    >
      {options}
    </Form.Select>
  );
};

ExistingLocalTargetReplicationRow.propTypes = {
  value: PropTypes.string.isRequired,
  databases: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

const NewLocalTargetReplicationRow = ({ onChange, value }) => {
  return (
    <Form.Control
      id="replication-target-new-local-database-database-name"
      type="text"
      className="form-control"
      placeholder="Database name"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

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
    <div className="row mt-2">
      <div className="col-12 col-md-2">{targetLabel}</div>
      <div className="col-12 col-md mt-1 mt-md-0">
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
    <React.Fragment>
      <div className="row mt-2">
        <div className="col-12 col-md-2">New database options:</div>
        <div className="col-12 col-md mt-1 mt-md-0">
          <Form.Check disabled>
            <Form.Check.Input
              id="target-db-is-partitioned"
              type="checkbox"
              value="true"
              checked={targetDatabasePartitioned}
              onChange={togglePartitioned}
              disabled={disablePartitionedOption}
            />

            <OverlayTrigger placement="right" overlay={tooltip}>
              <Form.Check.Label className="ms-2">
                Partitioned
              </Form.Check.Label>
            </OverlayTrigger>
          </Form.Check>
        </div>
      </div>
    </React.Fragment>
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
      <React.Fragment>
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
      </React.Fragment>
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
