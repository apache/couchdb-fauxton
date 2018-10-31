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

import React from "react";
import ReactDOM from "react-dom";
import FauxtonAPI from '../../../core/api';
import {
  changePassword
} from "./../actions";

import {connect} from 'react-redux';

export class ChangePasswordForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      password: '',
      passwordConfirm: ''
    };
  }

  onChangePassword(e) {
    this.setState({password: e.target.value});
  }

  onChangePasswordConfirm(e) {
    this.setState({passwordConfirm: e.target.value});
  }

  componentDidMount() {
    this.passwordField.focus();
  }

  changePassword(e) {
    e.preventDefault();
    this.props.changePassword(this.props.username, this.state.password, this.state.passwordConfirm, this.props.nodes);
  }

  render() {
    return (
      <div className="faux__auth-page">
        <h3>Change Password</h3>

        <form id="change-password" onSubmit={this.changePassword.bind(this)}>
          <p>
            Enter your new password.
          </p>

          <input
            id="password"
            type="password"
            ref={node => this.passwordField = node}
            name="password"
            placeholder="Password"
            size="24"
            onChange={this.onChangePassword.bind(this)}
            value={this.state.password}
          />
          <br />
          <input
            id="password-confirm"
            type="password"
            name="password_confirm"
            placeholder="Verify Password"
            size="24"
            onChange={this.onChangePasswordConfirm.bind(this)}
            value={this.state.passwordConfirm}
          />

          <br />
          <p>
            <button type="submit" className="btn btn-primary">Change</button>
          </p>
        </form>
      </div>
    );
  }
}

const mapStateToProps = ({clusters}) => {
  return {
    nodes: clusters.nodes,
    username: FauxtonAPI.session.user().name
  };
};

export default connect(
  mapStateToProps,
  {changePassword}
)(ChangePasswordForm);
