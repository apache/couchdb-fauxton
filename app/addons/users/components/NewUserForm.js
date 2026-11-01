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
import React from 'react';
import Form from 'react-bootstrap/Form';
import FauxtonAPI from '../../../core/api';
import Components from '../../components/react-components';
import * as Api from '../api';
import {buildUserDoc, getUserDocId, validatePassword, validateUsername} from '../helpers';
import RolesEditor from './RolesEditor';

const {ConfirmButton} = Components;

const initialState = () => ({
  name: '',
  password: '',
  passwordConfirm: '',
  roles: [],
  // true/false once the uniqueness check has run for the current name,
  // null when unknown
  nameExists: null,
  nameTouched: false,
  passwordConfirmTouched: false,
  submitting: false
});

export default class NewUserForm extends React.Component {
  constructor (props) {
    super(props);
    this.state = initialState();
    this.submit = this.submit.bind(this);
    this.clear = this.clear.bind(this);
    this.onNameBlur = this.onNameBlur.bind(this);
  }

  checkNameAvailable (name) {
    return this.props.checkUserExists(name).then(exists => {
      // Ignore the answer if the name was edited while the request was in flight
      if (this.state.name === name) {
        this.setState({nameExists: exists});
      }
      return exists;
    });
  }

  onNameBlur () {
    this.setState({nameTouched: true});
    const {name} = this.state;
    if (!validateUsername(name)) {
      this.checkNameAvailable(name).catch(() => {});
    }
  }

  getNameError () {
    const {name, nameExists, nameTouched} = this.state;
    if (nameExists) {
      return `A user named "${name}" already exists.`;
    }
    return nameTouched ? validateUsername(name) : null;
  }

  getPasswordError () {
    const {password, passwordConfirm, passwordConfirmTouched} = this.state;
    return passwordConfirmTouched ? validatePassword(password, passwordConfirm) : null;
  }

  submitButtonEnabled () {
    const {name, password, passwordConfirm, submitting} = this.state;
    return !!(name && password && passwordConfirm) && !submitting;
  }

  submit () {
    const {name, password, passwordConfirm, roles} = this.state;
    this.setState({nameTouched: true, passwordConfirmTouched: true});

    if (validateUsername(name) || validatePassword(password, passwordConfirm)) {
      return;
    }

    this.setState({submitting: true});
    this.checkNameAvailable(name).then(exists => {
      if (exists) {
        this.setState({submitting: false});
        return;
      }

      return this.props.createUser(buildUserDoc({name, password, roles})).then(() => {
        FauxtonAPI.addNotification({
          msg: `User "${name}" has been created.`,
          type: 'success',
          clear: true
        });
        this.setState(initialState());
        this.props.onUserCreated(name);
      });
    }).catch(err => {
      const isConflict = err.error === 'conflict';
      this.setState({submitting: false, nameExists: isConflict ? true : this.state.nameExists});
      FauxtonAPI.addNotification({
        msg: 'Failed to create user. Reason: ' + err.message,
        type: 'error',
        clear: true
      });
    });
  }

  clear () {
    this.setState(initialState());
  }

  render () {
    const {name, password, passwordConfirm, roles} = this.state;
    const nameError = this.getNameError();
    const passwordError = this.getPasswordError();

    return (
      <div className="container px-3 py-3">
        <div className="row">
          <div className="col-12"><h3>User</h3></div>
          <div className="col-12">
            <div className="row">
              <label className="col-12 col-md-2" htmlFor="new-user-name">Username:</label>
              <div className="col-12 col-md mt-1 mt-md-0">
                <Form.Control
                  id="new-user-name"
                  type="text"
                  placeholder="Username"
                  autoComplete="off"
                  value={name}
                  isInvalid={!!nameError}
                  onChange={(e) => this.setState({name: e.target.value, nameExists: null})}
                  onBlur={this.onNameBlur}
                />
                <Form.Control.Feedback type="invalid">{nameError}</Form.Control.Feedback>
                <Form.Text id="new-user-doc-id">
                  Document ID: <code>{getUserDocId(name)}</code>
                </Form.Text>
              </div>
            </div>
            <div className="row mt-2">
              <label className="col-12 col-md-2" htmlFor="new-user-password">Password:</label>
              <div className="col-12 col-md mt-1 mt-md-0">
                <Form.Control
                  id="new-user-password"
                  type="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => this.setState({password: e.target.value})}
                />
              </div>
            </div>
            <div className="row mt-2">
              <label className="col-12 col-md-2" htmlFor="new-user-password-confirm">Confirm password:</label>
              <div className="col-12 col-md mt-1 mt-md-0">
                <Form.Control
                  id="new-user-password-confirm"
                  type="password"
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  value={passwordConfirm}
                  isInvalid={!!passwordError}
                  onChange={(e) => this.setState({passwordConfirm: e.target.value})}
                  onBlur={() => this.setState({passwordConfirmTouched: true})}
                />
                <Form.Control.Feedback type="invalid">{passwordError}</Form.Control.Feedback>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-3" size="1"/>

        <div className="row">
          <div className="col-12"><h3>Roles</h3></div>
          <div className="col-12">
            <div className="row">
              <label className="col-12 col-md-2" htmlFor="new-user-role">Roles:</label>
              <div className="col-12 col-md mt-1 mt-md-0">
                <RolesEditor roles={roles} onChange={(newRoles) => this.setState({roles: newRoles})} />
                <Form.Text>Only server or database admins may assign roles.</Form.Text>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-12 text-end">
            <a
              className="users__clear-link"
              href="#"
              data-bypass="true"
              onClick={(e) => {
                e.preventDefault();
                this.clear();
              }}>
            Clear
            </a>
            <ConfirmButton
              customIcon="fonticon-user"
              id="create-user"
              text="Create User"
              onClick={this.submit}
              disabled={!this.submitButtonEnabled()}
            />
          </div>
        </div>
      </div>
    );
  }
}

NewUserForm.propTypes = {
  checkUserExists: PropTypes.func,
  createUser: PropTypes.func,
  onUserCreated: PropTypes.func
};

NewUserForm.defaultProps = {
  checkUserExists: Api.checkUserExists,
  createUser: Api.createUser,
  onUserCreated: () => {}
};
