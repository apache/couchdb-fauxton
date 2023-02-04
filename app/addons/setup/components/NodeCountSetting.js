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
import { Form } from 'react-bootstrap';


export default class NodeCountSetting extends React.Component {

  handleNodeCountChange = (event) => {
    this.props.onAlterNodeCount(event);
  };

  render() {
    return (
      <div className="row">
        <div className="col-12 col-md-5 col-xl-4 mb-3">
          <label>Number of nodes to be added to the cluster (including this one)</label>
          <Form.Control type="text"
            value={this.props.nodeCount}
            onChange={this.handleNodeCountChange}
            placeholder="Value of cluster n" />
        </div>
      </div>
    );
  }
}

NodeCountSetting.propTypes = {
  onAlterNodeCount: PropTypes.func.isRequired,
  nodeCount: PropTypes.number.isRequired
};
