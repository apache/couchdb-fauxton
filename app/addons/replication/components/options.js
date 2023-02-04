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

const getReplicationTypeOptions = () => {
  return [
    { value: Constants.REPLICATION_TYPE.ONE_TIME, label: 'One time' },
    { value: Constants.REPLICATION_TYPE.CONTINUOUS, label: 'Continuous' }
  ].map(option => <option value={option.value} key={option.value}>{option.label}</option>);
};

const ReplicationType = ({value, onChange}) => {
  return (
    <div className="row">
      <div className="col-12 col-md-2">Replication type:</div>
      <div className="col-12 col-md mt-1 mt-md-0">
        <Form.Select
          onChange={(e) => onChange(e.target.value)}
          id="replication-target"
          value={value}
        >
          {getReplicationTypeOptions()}
        </Form.Select>
      </div>
    </div>
  );
};

ReplicationType.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

const ReplicationDoc = ({value, onChange}) => {
  return (
    <div className="row mt-2">
      <div className="col-12 col-md-2">Replication document:</div>
      <div className="col-12 col-md mt-1 mt-md-0">
        <Form.Control
          id="replication-options-replication-doc"
          type="text"
          className="form-control"
          placeholder="Custom ID (optional)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

ReplicationDoc.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export class ReplicationOptions extends React.Component {

  render () {
    const {replicationType, replicationDocName, onDocChange, onTypeChange} = this.props;

    return (
      <div className="col-12">
        <ReplicationType
          onChange={onTypeChange}
          value={replicationType}
        />
        <ReplicationDoc
          onChange={onDocChange}
          value={replicationDocName}
        />
      </div>
    );
  }

}

ReplicationOptions.propTypes = {
  replicationDocName: PropTypes.string.isRequired,
  replicationType: PropTypes.string.isRequired,
  onDocChange: PropTypes.func.isRequired,
  onTypeChange: PropTypes.func.isRequired
};
