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

export const ReplicationFilter = ({value, onChange}) => {
  return (
    <div className="replication__filter">
      <i className="replication__filter-icon fonticon-filter" />
      <input
        type="text"
        placeholder="Filter replications"
        className="replication__filter-input"
        value={value}
        onChange={(e) => {onChange(e.target.value);}}
      />
    </div>
  );
};

ReplicationFilter.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export const ReplicationHeader = ({filter, onFilterChange}) => {
  return (
    <div className="replication__activity_header">
      <div></div>
      <ReplicationFilter value={filter} onChange={onFilterChange} />
      <a href="#/replication/_create" className="btn save replication__activity_header-btn btn-primary">
        <i className="icon fonticon-plus-circled"></i>
        New Replication
      </a>
    </div>
  );
};

ReplicationHeader.propTypes = {
  filter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired
};
