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

import PermissionsScreen  from './PermissionsScreen';

import { fetchPermissions } from '../actions';
import { LoadLines } from '../../components/components/loadlines';


export default class Permissions extends Component {

  constructor (props) {
    super(props);
  }

  componentDidMount() {
    const { dispatch, url } = this.props;
    dispatch(fetchPermissions(url));
  }

  render () {
    const { isLoading } = this.props;

    return (
      isLoading ? <LoadLines /> : <PermissionsScreen {...this.props} />
    );
  }
}

Permissions.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  adminRoles: PropTypes.array.isRequired,
  adminNames: PropTypes.array.isRequired,
  memberNames: PropTypes.array.isRequired,
  memberRoles: PropTypes.array.isRequired,
  security: PropTypes.object.isRequired
};
