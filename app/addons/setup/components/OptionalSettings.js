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
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

export default class OptionalSettings extends React.Component {
  handleIpChange = (event) => {
    this.props.onAlterBindAddress(event);
  };

  handlePortChange = (event) => {
    this.props.onAlterPort(event);
  };

  render() {
    return (
      <div className="row">
        <div className="col-12 col-md-5 col-xl-4 mb-3">
          <label>Bind address the node will listen on</label>
          <Form.Control type="text"
            value={this.props.ip}
            onChange={this.handleIpChange}
            placeholder="IP Address" />
        </div>
        <div className="col-12 col-md-5 col-xl-4 mb-3">
          <label>Port that the node will use</label>
          <Form.Control type="text"
            value={this.props.port}
            onChange={this.handlePortChange}
            placeholder="IP Address" />
        </div>
      </div>
    );
  }
}

OptionalSettings.propTypes = {
  ip: PropTypes.string.isRequired,
  port: PropTypes.number.isRequired,
  onAlterBindAddress: PropTypes.func.isRequired,
  onAlterPort: PropTypes.func.isRequired
};
