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
import ReactDOM from "react-dom";
import { login } from "./../actions";

class LoginForm extends React.Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: ""
    };
  }
  onUsernameChange(e) {
    this.setState({username: e.target.value});
  }
  onPasswordChange(e) {
    this.setState({password: e.target.value});
  }

  submit(e) {
    e.preventDefault();
    if (!this.checkUnrecognizedAutoFill()) {
      this.login(this.state.username, this.state.password);
    }
  }
  // Safari has a bug where autofill doesn't trigger a change event. This checks for the condition where the state
  // and form fields have a mismatch. See: https://issues.apache.org/jira/browse/COUCHDB-2829
  checkUnrecognizedAutoFill() {
    if (this.state.username !== "" || this.state.password !== "") {
      return false;
    }
    let username = this.props.testBlankUsername
      ? this.props.testBlankUsername
      : this.usernameField.value;
    let password = this.props.testBlankPassword
      ? this.props.testBlankPassword
      : this.passwordField.value;
    this.setState({ username: username, password: password }); // doesn't set immediately, hence separate login() call
    this.login(username, password);

    return true;
  }
  login(username, password) {
    login(username, password, this.props.urlBack);
  }
  componentDidMount() {
    this.usernameField.focus();
  }
  render() {
    return (
      <div className="couch-login-wrapper">
        <div className="row-fluid">
          <div className="span12">
            <form id="login" onSubmit={this.submit.bind(this)}>
              <p className="help-block">
                Enter your username and password.
              </p>
              <input
                id="username"
                type="text"
                name="username"
                ref={node => this.usernameField = node}
                placeholder="Username"
                size="24"
                onChange={this.onUsernameChange.bind(this)}
                value={this.state.username}
              />
              <br />
              <input
                id="password"
                type="password"
                name="password"
                ref={node => this.passwordField = node}
                placeholder="Password"
                size="24"
                onChange={this.onPasswordChange.bind(this)}
                value={this.state.password}
              />
              <br />
              <button id="submit" className="btn btn-success" type="submit">
                Log In
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

LoginForm.defaultProps = {
  urlBack: ""
};

LoginForm.propTypes = {
  urlBack: PropTypes.string.isRequired
};

export default LoginForm;
