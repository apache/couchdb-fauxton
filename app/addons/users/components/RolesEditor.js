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
import { Button, Form, InputGroup } from 'react-bootstrap';
import CloseButton from 'react-bootstrap/CloseButton';
import {validateRole} from '../helpers';

// Add/remove list of roles, modelled on the permissions role editor
export default class RolesEditor extends React.Component {
  state = {
    newRole: '',
    error: null
  };

  addRole = () => {
    const role = this.state.newRole.trim();
    const error = validateRole(role, this.props.roles);
    if (error) {
      this.setState({error});
      return;
    }
    this.props.onChange([...this.props.roles, role]);
    this.setState({newRole: '', error: null});
  };

  removeRole = (role) => {
    this.props.onChange(this.props.roles.filter(r => r !== role));
  };

  onRoleChange = (e) => {
    this.setState({newRole: e.target.value, error: null});
  };

  // The editor lives inside the user form, so Enter adds a role
  // instead of submitting the form.
  onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.addRole();
    }
  };

  render () {
    const {roles} = this.props;
    const {newRole, error} = this.state;

    return (
      <React.Fragment>
        <InputGroup hasValidation>
          <Form.Control
            id="new-user-role"
            placeholder="Role"
            aria-label="Role"
            type="text"
            value={newRole}
            isInvalid={!!error}
            onChange={this.onRoleChange}
            onKeyDown={this.onKeyDown}
          />
          <Button variant="cf-primary" aria-label="Add role" onClick={this.addRole}>
            <i className="fonticon-plus-circled" />Add Role
          </Button>
          <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
        </InputGroup>

        <ul className="list-unstyled users__roles-list">
          {roles.map(role => (
            <li key={role}>
              <span>{role}</span>
              <CloseButton className="float-end" aria-label={'Remove role ' + role} onClick={() => this.removeRole(role)} />
            </li>
          ))}
        </ul>
      </React.Fragment>
    );
  }
}

RolesEditor.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired
};
