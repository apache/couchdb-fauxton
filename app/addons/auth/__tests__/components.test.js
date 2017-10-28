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

import React from "react";
import ReactDOM from "react-dom";
import utils from "../../../../test/mocha/testUtils";
import LoginForm from "../components/loginform";
import {CreateAdminForm} from "../components/createadminform";
import {ChangePasswordForm} from '../components/changepasswordform';
import * as Actions from "../actions";
import { mount } from 'enzyme';
import sinon from "sinon";
const assert = utils.assert;

describe('Auth -- Components', () => {

  describe('LoginForm', () => {
    let stub;

    beforeEach(() => {
      stub = sinon.stub(Actions, 'login');
    });

    afterEach(() => {
      Actions.login.restore();
    });

    it('should trigger login event when form submitted', () => {
      const loginForm = mount(<LoginForm/>);
      loginForm.find('#login').simulate('submit');
      assert.ok(stub.calledOnce);
    });

    it('in case of nothing in state, should pass actual values to Actions.login()', () => {
      const username = 'bob';
      const password = 'smith';

      const loginForm = mount(
        <LoginForm
          testBlankUsername={username}
          testBlankPassword={password}
        />);

      loginForm.find('#login').simulate('submit');
      assert.ok(stub.calledOnce);

      // confirm Actions.login() received the values that weren't in the DOM
      assert.equal(stub.args[0][0], username);
      assert.equal(stub.args[0][1], password);
    });

  });

  describe('ChangePasswordForm', () => {

    it('should update state on password change', () => {
      const changePasswordForm = mount(<ChangePasswordForm />);
      changePasswordForm.find('#password').simulate('change', { target: { value: 'bobsyouruncle' }});
      assert.deepEqual(changePasswordForm.state('password'), 'bobsyouruncle');
    });

    it('should update state on password confirm change', () => {
      const changePasswordForm = mount(<ChangePasswordForm />);
      changePasswordForm.find('#password-confirm').simulate('change', { target: { value: 'hotdiggity' }});
      assert.deepEqual(changePasswordForm.state('passwordConfirm'), 'hotdiggity');
    });

    it('should call action to submit form', () => {
      const spy = sinon.spy();
      const changePasswordForm = mount(<ChangePasswordForm username={"bobsyouruncle"} changePassword={spy} />);
      changePasswordForm.find('#change-password').simulate('submit');
      assert.ok(spy.calledOnce);
    });
  });

  describe('CreateAdminForm', () => {
    it('should update username state', () => {
      const createAdminForm = mount(<CreateAdminForm loginAfter={false} />);
      createAdminForm.find('#username').simulate('change',  { target: { value: 'catsmeow' }});
      assert.deepEqual(createAdminForm.state('username'), 'catsmeow');
    });

    it('should call action to update password confirm on field change', () => {
      const createAdminForm = mount(<CreateAdminForm loginAfter={false} />);
      createAdminForm.find('#password').simulate('change',  { target: { value: 'topnotch' }});
      assert.deepEqual(createAdminForm.state('password'), 'topnotch');
    });
  });
});
