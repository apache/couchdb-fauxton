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

import React from "react";
import {
  createAdmin
} from "./../actions";
import {connect} from 'react-redux';

export class CreateAdminForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: ''
    };
  }

  onChangeUsername(e) {
    this.setState({username: e.target.value});
  }

  onChangePassword(e) {
    this.setState({password: e.target.value});
  }

  componentDidMount() {
    this.usernameField.focus();
  }

  createAdmin(e) {
    e.preventDefault();
    this.props.createAdmin(
      this.state.username,
      this.state.password,
      this.props.loginAfter,
      this.props.nodes
    );
  }

  render() {
    return (
      <div className="faux__auth-page">
        <h3>Create Admins</h3>

        <p>
          Before a server admin is configured, all clients have admin privileges. This is fine when

          HTTP access is restricted to trusted users. <strong>
            If end-users will be accessing this
            CouchDB, you must create an admin account to prevent accidental (or malicious) data

            loss.
          </strong>
        </p>
        <p>
          Server admins can create and destroy databases, install and update _design documents, run

          the test suite, and edit all aspects of CouchDB configuration.
        </p>

        <form id="create-admin-form" onSubmit={this.createAdmin.bind(this)}>
          <input
            id="username"
            type="text"
            ref={node => this.usernameField = node}
            name="name"
            placeholder="Username"
            size="24"
            onChange={this.onChangeUsername.bind(this)}
          />
          <br />
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            size="24"
            onChange={this.onChangePassword.bind(this)}
          />
          <p>
            Non-admin users have read and write access to all databases, which
            are controlled by validation. CouchDB can be configured to block all
            access to anonymous users.
          </p>
          <button type="submit" id="create-admin" className="btn btn-primary">
            Create Admin
          </button>
        </form>
      </div>
    );
  }
}

CreateAdminForm.propTypes = {
  loginAfter: PropTypes.bool.isRequired
};

CreateAdminForm.defaultProps = {
  loginAfter: false
};

const mapStateToProps = ({clusters}) => {
  return {
    nodes: clusters.nodes
  };
};


export default connect(
  mapStateToProps,
  {createAdmin}
)(CreateAdminForm);
