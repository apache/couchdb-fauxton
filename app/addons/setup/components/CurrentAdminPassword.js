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


export default class SetupCurrentAdminPassword extends React.Component {
  render() {
    let text = 'Specify your Admin credentials';

    if (this.props.isAdminParty) {
      text = 'Create Admin credentials.';
    }

    return (
      <div className="setup-creds">
        <div>
          <p>{text}</p>
        </div>
        <input
          className="setup-username"
          onChange={this.props.onAlterUsername}
          placeholder="Username"
          value={this.props.username}
          type="text"/>
        <input
          className="setup-password"
          onChange={this.props.onAlterPassword}
          placeholder="Password"
          value={this.props.password}
          type="password"/>
      </div>
    );
  }
}

SetupCurrentAdminPassword.propTypes = {
  onAlterUsername: PropTypes.func.isRequired,
  onAlterPassword: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  isAdminParty: PropTypes.bool
};
