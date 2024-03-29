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

import React from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import FauxtonAPI from '../../../core/api';
import app from '../../../app';
import _ from 'lodash';

import PermissionsItem from './PermissionsItem';


const getDocUrl = app.helpers.getDocUrl;

class PermissionsSection extends React.Component {
  static defaultProps = {
    names: [],
    roles: []
  };

  state = {
    newRole: '',
    newName: ''
  };

  getHelp = () => {
    if (this.props.section === 'admins') {
      return 'Database members can access the database. If no members are defined, the database is public. ';
    }

    return 'Database members can access the database. If no members are defined, the database is public. ';
  };

  isEmptyValue = (value, type) => {
    if (!_.isEmpty(value)) {
      return false;
    }
    FauxtonAPI.addNotification({
      msg: 'Cannot add an empty value for ' + type + '.',
      type: 'error'
    });

    return true;
  };

  addNames = (e) => {
    e.preventDefault();
    if (this.isEmptyValue(this.state.newName, 'names')) {
      return;
    }
    this.props.addItem({
      type: 'names',
      section: this.props.section,
      value: this.state.newName
    });

    this.setState({newName: ''});
  };

  addRoles = (e) => {
    e.preventDefault();
    if (this.isEmptyValue(this.state.newRole, 'roles')) {
      return;
    }
    this.props.addItem({
      type: 'roles',
      section: this.props.section,
      value: this.state.newRole
    });

    this.setState({newRole: ''});
  };

  getItems = (items, type) => {
    return items.map((item, i) => {
      return <PermissionsItem
        key={i}
        value={item}
        section={this.props.section}
        type={type}
        removeItem={this.props.removeItem} />;
    });
  };

  getNames = () => {
    return this.getItems(this.props.names, 'names');
  };

  getRoles = () => {
    return this.getItems(this.props.roles, 'roles');
  };

  nameChange = (e) => {
    this.setState({newName: e.target.value});
  };

  roleChange = (e) => {
    this.setState({newRole: e.target.value});
  };

  render() {

    const { section } = this.props;

    return (
      <div id={"permissions__" + section}>
        <header className="page-header">
          <h3>{section}</h3>
          <p className="help">
            {this.getHelp()}
            <a className="help-link" data-bypass="true" href={getDocUrl('DB_PERMISSION')} target="_blank" rel="noopener noreferrer">
              <i className="fonticon-help-circled"></i>
            </a>
          </p>
        </header>

        <div className="row mt-2">
          <div className="col-lg-6">
            <header>
              <h4>Users</h4>
              <p>Specify users who will have {this.props.section} access to this database.</p>
            </header>

            <form onSubmit={this.addNames} id="form-users-permissions">
              <InputGroup>
                <Form.Control
                  placeholder="Username"
                  onChange={this.nameChange}
                  aria-label="Username"
                  type="text" />

                <Button type="submit" variant="cf-primary" aria-label="Add username"><i className="fonticon-plus-circled" />Add User</Button>
              </InputGroup>
            </form>

            <ul className="list-unstyled permission-items">
              {this.getNames()}
            </ul>
          </div>
          <div className="col-lg-6">
            <header>
              <h4>Roles</h4>
              <p>Users with any of the following role(s) will have {this.props.section} access.</p>
            </header>

            <form onSubmit={this.addRoles}>
              <InputGroup>
                <Form.Control
                  placeholder="Role"
                  value={this.state.newRole}
                  onChange={this.roleChange}
                  aria-label="Role"
                  type="text" />

                <Button type="submit" variant="cf-primary" aria-label="Add role"><i className="fonticon-plus-circled" />Add Role</Button>
              </InputGroup>
            </form>

            <ul className="list-unstyled permission-items">
              {this.getRoles()}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default PermissionsSection;
