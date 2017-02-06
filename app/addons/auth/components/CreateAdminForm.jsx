import React from "react";
import ReactDOM from "react-dom";
import { createAdminStore } from "./../stores";
import {
  updateCreateAdminUsername,
  updateCreateAdminPassword,
  createAdmin
} from "./../actions";

class CreateAdminForm extends React.Component {
  getInitialState() {
    return this.getStoreState();
  }
  getStoreState() {
    return {
      username: createAdminStore.getUsername(),
      password: createAdminStore.getPassword()
    };
  }
  onChange() {
    this.setState(this.getStoreState());
  }
  getDefaultProps() {
    return {
      loginAfter: ""
    };
  }
  onChangeUsername(e) {
    updateCreateAdminUsername(e.target.value);
  }
  onChangePassword(e) {
    updateCreateAdminPassword(e.target.value);
  }
  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.username).focus();
    createAdminStore.on("change", this.onChange, this);
  }
  componentWillUnmount() {
    createAdminStore.off("change", this.onChange);
  }
  createAdmin(e) {
    e.preventDefault();
    createAdmin(
      this.state.username,
      this.state.password,
      this.props.loginAfter
    );
  }
  render() {
    return (
      <div className="auth-page">
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

        <form id="create-admin-form" onSubmit={this.createAdmin}>
          <input
            id="username"
            type="text"
            ref="username"
            name="name"
            placeholder="Username"
            size="24"
            onChange={this.onChangeUsername}
          />
          <br />
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            size="24"
            onChange={this.onChangePassword}
          />
          <p>
            Non-admin users have read and write access to all databases, which
            are controlled by validatio. CouchDB can be configured to block all
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
  loginAfter: React.PropTypes.bool.isRequired
};

export default CreateAdminForm;
