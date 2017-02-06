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
  onInputChange(e) {
    var change = e.target.name === "name"
      ? { username: e.target.value }
      : { password: e.target.value };
    this.setState(change);
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
    var username = this.props.testBlankUsername
      ? this.props.testBlankUsername
      : ReactDOM.findDOMNode(this.refs.username).value;
    var password = this.props.testBlankPassword
      ? this.props.testBlankPassword
      : ReactDOM.findDOMNode(this.refs.password).value;
    this.setState({ username: username, password: password }); // doesn't set immediately, hence separate login() call
    this.login(username, password);

    return true;
  }
  login(username, password) {
    login(username, password, this.props.urlBack);
  }
  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.username).focus();
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
                name="name"
                ref="username"
                placeholder="Username"
                size="24"
                onChange={this.onInputChange.bind(this)}
                value={this.state.username}
              />
              <br />
              <input
                id="password"
                type="password"
                name="password"
                ref="password"
                placeholder="Password"
                size="24"
                onChange={this.onInputChange.bind(this)}
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
   urlBack: "",
  // for testing purposes only
  testBlankUsername: null,
  testBlankPassword: null
};

LoginForm.propTypes = {
  urlBack: React.PropTypes.string.isRequired
};

export default LoginForm;
