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
import FauxtonAPI from '../../../core/base';
import { login } from "./../actions";
import { Button, Form } from 'react-bootstrap';

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

  navigateToIdp(e) {
    e.preventDefault();
    FauxtonAPI.navigate('/loginidp');
  }

  componentDidMount() {
    this.usernameField.focus();
  }
  render() {
    return (
      <div className="couch-login-wrapper">
        <form id="login" onSubmit={this.submit.bind(this)}>
          <div className="row">
            <div className="col12 col-md-5 col-xl-4 mb-3">
              <label>
                Enter your username and password
              </label>
              <Form.Control type="text"
                id="username"
                name="username"
                ref={node => this.usernameField = node}
                placeholder="Username"
                onChange={this.onUsernameChange.bind(this)}
                value={this.state.username} />
            </div>
          </div>
          <div className="row">
            <div className="col12 col-md-5 col-xl-4 mb-3">
              <Form.Control type="password"
                id="password"
                name="password"
                ref={node => this.passwordField = node}
                placeholder="Password"
                onChange={this.onPasswordChange.bind(this)}
                value={this.state.password} />
            </div>
          </div>
          <div className="row">
            <div className="col12 col-md-5 col-xl-4 mb-3">
              <Button id="login-btn" variant="cf-primary" type="submit">
                Log In
              </Button>
            </div>
          </div>
        </form>
        <div className="row">
          <div className="col12 col-md-5 col-xl-4 mb-3">
            <Button id="login-idp-btn" variant="cf-secondary" onClick={this.navigateToIdp}>
              Log In with your Identity Provider
            </Button>
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
