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
        urlBack: '',

        // for testing purposes only
        testBlankUsername: null,
        testBlankPassword: null
      };
    },

    onInputChange: function (e) {
      var change = (e.target.name === 'name') ? { username: e.target.value } : { password: e.target.value };
      this.setState(change);
    },

    submit: function (e) {
      e.preventDefault();

      if (!this.checkUnrecognizedAutoFill()) {
        this.login(this.state.username, this.state.password);
      }
    },

    // Safari has a bug where autofill doesn't trigger a change event. This checks for the condition where the state
    // and form fields have a mismatch. See: https://issues.apache.org/jira/browse/COUCHDB-2829
    checkUnrecognizedAutoFill: function () {
      if (this.state.username !== '' || this.state.password !== '') {
        return false;
      }
      var username = (this.props.testBlankUsername) ? this.props.testBlankUsername : React.findDOMNode(this.refs.username).value;
      var password = (this.props.testBlankPassword) ? this.props.testBlankPassword : React.findDOMNode(this.refs.password).value;
      this.setState({ username: username, password: password }); // doesn't set immediately, hence separate login() call
      this.login(username, password);

      return true;
    },

    login: function (username, password) {
      AuthActions.login(username, password, this.props.urlBack);
    },

    componentDidMount: function () {
      React.findDOMNode(this.refs.username).focus();
    },

    render: function () {
      return (
        <div className="row-fluid">
          <div className="span12">
            <form id="login" onSubmit={this.submit}>
              <p className="help-block">
                Login with your username and password
              </p>
              <input id="username" type="text" name="name" ref="username" placeholder="Username" size="24"
                onChange={this.onInputChange} value={this.state.username} />
              <br/>
              <input id="password" type="password" name="password" ref="password" placeholder="Password" size="24"
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
      React.findDOMNode(this.refs.password).focus();
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

          <form id="change-password" onSubmit={this.changePassword}>
            <p>
              Enter your new password.
            </p>

            <input id="password" type="password" ref="password" name="password" placeholder="Password"
              size="24" onChange={this.onChangePassword} value={this.state.password} />
            <br />
            <input id="password-confirm" type="password" name="password_confirm" placeholder="Password confirmation"
              size="24" onChange={this.onChangePasswordConfirm} value={this.state.passwordConfirm} />

            <br />
            <p>
              <button type="submit" className="btn btn-primary">Change Password</button>
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
      React.findDOMNode(this.refs.username).focus();
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
          <h3>Create User Accounts with ADMIN Privileges</h3>

          <p>
            Before an admin user account is created for this CouchDB server instance,
            all clients have ADMIN privileges.  <strong>If clients are not trusted users,
            you must create an admin account to prevent accidental or malicious data loss.</strong>
          </p>
          <p>
            Users with ADMIN privileges can create, modify, and delete databases and design documents;
            run the test suite; and modify the CouchDB configuration. Users without ADMIN privileges
            have read/write access to all databases. CouchDB can be <a href="http://docs.couchdb.org/en/1.6.1/config/auth.html"
            target="_new" title="CouchDB link">configured</a> to block the access of anonymous users.
          </p>

          <form id="create-admin-form" onSubmit={this.createAdmin}>
            <input id="username" type="text" ref="username" name="name" placeholder="Username" size="24"
              onChange={this.onChangeUsername} />
            <br/>
            <input id="password" type="password" name="password" placeholder= "Password" size="24"
              onChange={this.onChangePassword} />
            <p>
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
              <a href="#addAdmin">Create Other Admins</a>
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
