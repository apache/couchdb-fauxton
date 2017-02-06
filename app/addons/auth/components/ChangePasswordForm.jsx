import React from "react";
import ReactDOM from "react-dom";
import { changePasswordStore } from "./../stores";
import {
  updateChangePasswordField,
  updateChangePasswordConfirmField,
  changePassword
} from "./../actions";

export default class ChangePasswordForm extends React.Component {
  getInitialState() {
    return this.getStoreState();
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

        <form id="change-password" onSubmit={this.changePassword}>
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
            onChange={this.onChangePassword}
            value={this.state.password}
          />
          <br />
          <input
            id="password-confirm"
            type="password"
            name="password_confirm"
            placeholder="Verify Password"
            size="24"
            onChange={this.onChangePasswordConfirm}
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
