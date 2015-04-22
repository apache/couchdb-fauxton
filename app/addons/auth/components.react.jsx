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

define([
  'app',
  'api',
  'react',
  'addons/auth/stores',
  'addons/auth/actions'
], function (app, FauxtonAPI, React, AuthStores, AuthActions) {

  var changePasswordStore = AuthStores.changePasswordStore;
  var createAdminStore = AuthStores.createAdminStore;
  var createAdminSidebarStore = AuthStores.createAdminSidebarStore;


  var LoginForm = React.createClass({
    propTypes: {
      urlBack: React.PropTypes.string.isRequired
    },

    getInitialState: function () {
      return {
        username: '',
        password: ''
      };
    },

    getDefaultProps: function () {
      return {
        urlBack: ''
      };
    },

    onInputChange: function (e) {
      var change = (e.target.name === 'name') ? { username: e.target.value } : { password: e.target.value };
      this.setState(change);
    },

    login: function (e) {
      e.preventDefault();
      AuthActions.login(this.state.username, this.state.password, this.props.urlBack);
    },

    componentDidMount: function () {
      this.refs.username.getDOMNode().focus();
    },

    render: function () {
      return (
        <div className="row-fluid">
          <div className="span12">
            <form id="login" onSubmit={this.login}>
              <p className="help-block">
                Login with your username and password
              </p>
              <input id="username" type="text" name="name" ref="username" placeholder="Username" size="24"
                onChange={this.onInputChange} value={this.state.username} />
              <br/>
              <input id="password" type="password" name="password" placeholder="Password" size="24"
                onChange={this.onInputChange} value={this.state.password} />
              <br/>
              <button id="submit" className="btn" type="submit">Login</button>
            </form>
          </div>
        </div>
      );
    }
  });


  var ChangePasswordForm = React.createClass({
    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        password: changePasswordStore.getChangePassword(),
        passwordConfirm: changePasswordStore.getChangePasswordConfirm()
      };
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    onChangePassword: function (e) {
      AuthActions.updateChangePasswordField(e.target.value);
    },

    onChangePasswordConfirm: function (e) {
      AuthActions.updateChangePasswordConfirmField(e.target.value);
    },

    componentDidMount: function () {
      this.refs.password.getDOMNode().focus();
      changePasswordStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      changePasswordStore.off('change', this.onChange);
    },

    changePassword: function (e) {
      e.preventDefault();
      AuthActions.changePassword(this.state.password, this.state.passwordConfirm);
    },

    render: function () {
      return (
        <div className="auth-page">
          <h3>Change Password</h3>

          <form id="change-password" onSubmit={this.changePassword}>
            <p>
              Enter your new password.
            </p>

            <input id="password" type="password" ref="password" name="password" placeholder="Password"
              size="24" onChange={this.onChangePassword} value={this.state.password} />
            <br />
            <input id="password-confirm" type="password" name="password_confirm" placeholder= "Verify Password"
              size="24" onChange={this.onChangePasswordConfirm} value={this.state.passwordConfirm} />

            <br />
            <p>
              <button type="submit" className="btn btn-primary">Change</button>
            </p>
          </form>
        </div>
      );
    }
  });


  var CreateAdminForm = React.createClass({
    propTypes: {
      loginAfter: React.PropTypes.bool.isRequired
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        username: createAdminStore.getUsername(),
        password: createAdminStore.getPassword()
      };
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    getDefaultProps: function () {
      return {
        loginAfter: ''
      };
    },

    onChangeUsername: function (e) {
      AuthActions.updateCreateAdminUsername(e.target.value);
    },

    onChangePassword: function (e) {
      AuthActions.updateCreateAdminPassword(e.target.value);
    },

    componentDidMount: function () {
      this.refs.username.getDOMNode().focus();
      createAdminStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      createAdminStore.off('change', this.onChange);
    },

    createAdmin: function (e) {
      e.preventDefault();
      AuthActions.createAdmin(this.state.username, this.state.password, this.props.loginAfter);
    },

    render: function () {
      return (
        <div className="auth-page">
          <h3>Create Admins</h3>

          <p>
            Before a server admin is configured, all clients have admin privileges. This is fine when
            HTTP access is restricted to trusted users. <strong>If end-users will be accessing this
            CouchDB, you must create an admin account to prevent accidental (or malicious) data
            loss.</strong>
          </p>
          <p>
            Server admins can create and destroy databases, install and update _design documents, run
            the test suite, and edit all aspects of CouchDB configuration.
          </p>

          <form id="create-admin-form" onSubmit={this.createAdmin}>
            <input id="username" type="text" ref="username" name="name" placeholder="Username" size="24"
              onChange={this.onChangeUsername} />
            <br/>
            <input id="password" type="password" name="password" placeholder= "Password" size="24"
              onChange={this.onChangePassword} />
            <p>
              Non-admin users have read and write access to all databases, which
              are controlled by validation functions. CouchDB can be configured to block all
              access to anonymous users.
            </p>
            <button type="submit" id="create-admin" className="btn btn-primary">Create Admin</button>
          </form>
        </div>
      );
    }
  });


  var CreateAdminSidebar = React.createClass({
    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        selectedPage: createAdminSidebarStore.getSelectedPage()
      };
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    componentDidMount: function () {
      createAdminSidebarStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      createAdminSidebarStore.off('change', this.onChange);
    },

    selectPage: function (e) {
      var newPage = e.target.href.split('#')[1];
      AuthActions.selectPage(newPage);
    },

    render: function () {
      var user = FauxtonAPI.session.user();
      var userName = _.isNull(user) ? '' : FauxtonAPI.session.user().name;

      return (
        <div className="sidenav">
          <header className="row-fluid">
            <h3>{userName}</h3>
          </header>
          <ul className="nav nav-list" onClick={this.selectPage}>
            <li className={this.state.selectedPage === 'changePassword' ? 'active' : ''} data-page="changePassword">
              <a href="#changePassword">Change Password</a>
            </li>
            <li className={this.state.selectedPage === 'addAdmin' ? 'active' : ''} data-page="addAdmin">
              <a href="#addAdmin">Create Admins</a>
            </li>
          </ul>
        </div>
      );
    }
  });

  return {
    LoginForm: LoginForm,
    ChangePasswordForm: ChangePasswordForm,
    CreateAdminForm: CreateAdminForm,
    CreateAdminSidebar: CreateAdminSidebar
  };


});
