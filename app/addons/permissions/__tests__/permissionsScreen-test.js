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
import { mount } from 'enzyme';

import PermissionsScreen from '../components/PermissionsScreen';


describe('PermissionsScreen', () => {

  it('add permississon: does not dispatch if value already exists', () => {

    const security = {
      admins:  { names: ['abc'], roles: [] },
      members: { names: [], roles: [] }
    };
    const stub = jest.fn();

    const wrapper = mount(
      <PermissionsScreen
        adminRoles={security.admins.roles}
        adminNames={security.admins.names}
        memberRoles={security.members.roles}
        memberNames={security.members.names}
        security={security}
        dispatch={stub} />
    );

    wrapper
      .find('.permissions__admins .permissions-add-user input')
      .simulate('change', {target: {value: 'abc'}});

    wrapper
      .find('.permissions__admins .permissions-add-user')
      .simulate('submit');

    expect(stub).not.toHaveBeenCalled();
  });

  it('add permississon: dispatches if values does not exist', () => {

    const security = {
      admins:  { names: ['pineapple'], roles: [] },
      members: { names: [], roles: [] }
    };
    const stub = jest.fn();

    const wrapper = mount(
      <PermissionsScreen security={security} dispatch={stub} />
    );

    wrapper
      .find('.permissions__admins .permissions-add-user input')
      .simulate('change', {target: {value: 'mango'}});

    wrapper
      .find('.permissions__admins .permissions-add-user')
      .simulate('submit');

    expect(stub).toHaveBeenCalled();
  });

  it('remove permississon: dispatches', () => {

    const security = {
      admins:  { names: ['pineapple'], roles: [] },
      members: { names: [], roles: [] }
    };
    const stub = jest.fn();

    const wrapper = mount(
      <PermissionsScreen
        adminRoles={security.admins.roles}
        adminNames={security.admins.names}
        memberRoles={security.members.roles}
        memberNames={security.members.names}
        security={security}
        dispatch={stub} />
    );

    wrapper
      .find('.permissions__admins .permissions__entry button')
      .simulate('click');

    expect(stub).toHaveBeenCalled();
  });
});
