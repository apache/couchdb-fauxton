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
import { login, loginApiKey } from "./../actions";

class LoginForm extends React.Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",
      apikey: "",
      checked: false
    };
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange() {
    this.setState({
      checked: !this.state.checked
    });
  }

  onUsernameChange(e) {
    this.setState({username: e.target.value});
  }
  onPasswordChange(e) {
    this.setState({password: e.target.value});
  }

  onApikeyChange(e) {
    this.setState({apikey: e.target.value});
  }

  submit(e) {
    e.preventDefault();


    if (this.state.checked) {
      this.loginApiKey(this.state.apikey);
    } else if (!this.checkUnrecognizedAutoFill()) {
      this.login(this.state.username, this.state.password);
      //this.loginApiKey(this.state.apikey);
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

  writeCookie (key, value, hours) {
    const date = new Date();

    // Default at 365 days.
    hours = hours || 1;

    // Get unix milliseconds at current time plus number of days
    date.setTime(date + (hours * 60 * 60 * 1000)); //24 * 60 * 60 * 1000

    window.document.cookie = key + "=" + value + "; expires=" + date.toGMTString() + "; path=/";

    return value;
  }

  login(username, password) {
    // document.cookie = "isApiKey=N";
    this.writeCookie('isApiKey', 'N', 1);
    // global.isApiKey = 'N';
    login(username, password, this.props.urlBack);
  }

  loginApiKey(apiKey) {
    document.cookie = "isApiKey=Y";
    // global.isApiKey = 'Y';
    loginApiKey(apiKey, this.props.urlBack);
  }
  componentDidMount() {
    this.usernameField.focus();
  }
  render() {
    document.cookie = "isApiKey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // const hidden = this.state.checked ? '' : 'hidden';
    const content = !this.state.checked
      ? <form id="login" onSubmit={this.submit.bind(this)}>
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
      : <form id="login" onSubmit={this.submit.bind(this)}>
        <p className="help-block">
          Enter your API KEY.
        </p>
        <input
          id="apikey"
          type="text"
          name="apikey"
          ref={node => this.apikeyField = node}
          placeholder="API KEY"
          size="24"
          onChange={this.onApikeyChange.bind(this)}
          value={this.state.apikey}
        />
        <br />
        <br />
        <button id="submit" className="btn btn-success" type="submit">
          Log In
        </button>
      </form>;


    return (

      <div className="couch-login-wrapper">
        <div className="row-fluid">
          <div className="span12">
            <div className="ui checkbox">
              <input style={{ "marginTop": 4 }} type="checkbox" checked={ this.state.checked } onChange={ this.handleChange } />
              <label style={{ "paddingLeft": 5 }} htmlFor={this.id}>Use API KEY?</label></div>
            { content }

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
