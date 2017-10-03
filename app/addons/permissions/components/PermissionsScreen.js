import FauxtonAPI from '../../../core/api';

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

import React, { Component } from 'react';

import PermissionsSection from './PermissionsSection';
import { updatePermission, deletePermission } from '../actions';
import { isValueAlreadySet } from '../helpers';

export default class PermissionsScreen extends Component {

  constructor (props) {
    super(props);

    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
  }

  addItem ({ section, type, value }) {

    if (isValueAlreadySet(this.props.security, section, type, value)) {
      FauxtonAPI.addNotification({
        msg: 'Role/Name has already been added',
        type: 'error'
      });

      return null;
    }

    this.props.dispatch(
      updatePermission(this.props.url, this.props.security, section, type, value)
    );
  }

  removeItem (section, type, value) {

    this.props.dispatch(
      deletePermission(this.props.url, this.props.security, section, type, value)
    );
  }

  render () {
    const {
      adminRoles,
      adminNames,
      memberRoles,
      memberNames
    } = this.props;

    return (
      <div className="permissions-page flex-body">
        <div>
          <PermissionsSection
            roles={adminRoles}
            names={adminNames}
            addItem={this.addItem}
            removeItem={this.removeItem}
            section="admins" />

          <PermissionsSection
            roles={memberRoles}
            names={memberNames}
            addItem={this.addItem}
            removeItem={this.removeItem}
            section="members" />
        </div>
      </div>
    );
  }

}

PermissionsScreen.propTypes = {
  security: PropTypes.object.isRequired
};
