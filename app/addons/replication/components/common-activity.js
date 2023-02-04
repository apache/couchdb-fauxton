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
import { Button, Form, InputGroup } from 'react-bootstrap';

export const ReplicationFilter = ({value, onChange}) => {
  return (
    <InputGroup id="replication-filter-group">
      <InputGroup.Text><i className="fonticon-filter" /></InputGroup.Text>
      <Form.Control
        id="replication-filter-input"
        type="text"
        placeholder="Filter replications"
        value={value}
        onChange={(e) => {onChange(e.target.value);}}
        aria-label="Filter replication results"
      />
    </InputGroup>
  );
};

ReplicationFilter.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export const ReplicationHeader = ({filter, onFilterChange}) => {
  return (
    <div className="row">
      <div className="col-12 col-md-6">
        <ReplicationFilter value={filter} onChange={onFilterChange} />
      </div>
      <div className="col-12 col-md text-end">
        <Button id="new-replication-btn" className="mt-2 mt-md-0" href="#/replication/_create" variant="cf-primary">
          <i className="fonticon-plus-circled"></i>
          New Replication
        </Button>
      </div>
    </div>
  );
};

ReplicationHeader.propTypes = {
  filter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired
};
