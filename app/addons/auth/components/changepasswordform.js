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
import { changePasswordStore } from "./../stores";
import {
  updateChangePasswordField,
  updateChangePasswordConfirmField,
  changePassword
} from "./../actions";

export default class ChangePasswordForm extends React.Component {
  constructor() {
    super();
    this.state = this.getStoreState();
  }
  getStoreState() {
    return {
      password: changePasswordStore.getChangePassword(),
      passwordConfirm: changePasswordStore.getChangePasswordConfirm()
    };
  }
  onChange() {
    this.setState(this.getStoreState());
  }
  onChangePassword(e) {
    updateChangePasswordField(e.target.value);
  }
  onChangePasswordConfirm(e) {
    updateChangePasswordConfirmField(e.target.value);
  }
  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.password).focus();
    changePasswordStore.on("change", this.onChange, this);
  }
  componentWillUnmount() {
    changePasswordStore.off("change", this.onChange);
  }
  changePassword(e) {
    e.preventDefault();
    changePassword(this.state.password, this.state.passwordConfirm);
  }
  render() {
    return (
      <div className="auth-page">
        <h3>Change Password</h3>

        <form id="change-password" onSubmit={this.changePassword.bind(this)}>
          <p>
            Enter your new password.
          </p>

          <input
            id="password"
            type="password"
            ref="password"
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
