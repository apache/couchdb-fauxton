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
import FauxtonAPI from "../../../core/api";
import React from "react";
import ReactDOM from "react-dom";
import utils from "../../../../test/mocha/testUtils";
import Components from "../components.react";
import Stores from "../stores";
import Actions from "../actions";
import TestUtils from "react-addons-test-utils";
import { mount } from 'enzyme';
import sinon from "sinon";
var assert = utils.assert;

var createAdminSidebarStore = Stores.createAdminSidebarStore;

describe('Auth -- Components', () => {

  describe('LoginForm', () => {
    let stub;

    beforeEach(() => {
      stub = sinon.stub(Actions, 'login');
    });

    afterEach(() => {
      createAdminSidebarStore.reset();
      Actions.login.restore();
    });

    it('should trigger login event when form submitted', () => {
      const loginForm = mount(<Components.LoginForm/>);
      loginForm.find('#login').simulate('submit');
      assert.ok(stub.calledOnce);
    });

    it('in case of nothing in state, should pass actual values to Actions.login()', () => {
      const username = 'bob';
      const password = 'smith';

      const loginForm = mount(
        <Components.LoginForm
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
    var container, changePasswordForm;

    beforeEach(() => {
      utils.restore(Actions.changePassword);
    });

    it('should call action to update password on field change', () => {
      const changePasswordForm = mount(<Components.ChangePasswordForm />);
      const spy = sinon.spy(Actions, 'updateChangePasswordField');
      changePasswordForm.find('#password').simulate('change', { target: { value: 'bobsyouruncle' }});
      assert.ok(spy.calledOnce);
    });

    it('should call action to update password confirm on field change', () => {
      const changePasswordForm = mount(<Components.ChangePasswordForm />);
      const spy = sinon.spy(Actions, 'updateChangePasswordConfirmField');
      changePasswordForm.find('#password-confirm').simulate('change', { target: { value: 'hotdiggity' }});
      assert.ok(spy.calledOnce);
    });

    it('should call action to submit form', () => {
      const changePasswordForm = mount(<Components.ChangePasswordForm />);
      var stub = sinon.stub(Actions, 'changePassword', () => {});
      changePasswordForm.find('#change-password').simulate('submit');
      assert.ok(stub.calledOnce);
    });
  });

  describe('CreateAdminForm', () => {
    it('should call action to update username on field change', () => {
      const createAdminForm = mount(<Components.CreateAdminForm loginAfter={false} />);
      var spy = sinon.spy(Actions, 'updateCreateAdminUsername');
      createAdminForm.find('#username').simulate('change',  { target: { value: 'catsmeow' }});
      assert.ok(spy.calledOnce);
    });

    it('should call action to update password confirm on field change', () => {
      const createAdminForm = mount(<Components.CreateAdminForm loginAfter={false} />);
      var spy = sinon.spy(Actions, 'updateCreateAdminPassword');
      createAdminForm.find('#password').simulate('change',  { target: { value: 'topnotch' }});
      assert.ok(spy.calledOnce);
    });
  });

  describe('CreateAdminSidebar', () => {
    beforeEach(() => {
      createAdminSidebarStore.reset();
    });

    it('confirm the default selected nav item is the change pwd page', () => {
      const wrapper = mount(<Components.CreateAdminSidebar />)
      assert.equal(wrapper.find('.active a').props().href, '#changePassword');
    });

    it('confirm clicking a sidebar nav item selects it in the DOM', () => {
      const wrapper = mount(<Components.CreateAdminSidebar />)
      wrapper.find('li[data-page="addAdmin"]').find('a').simulate('click');
      assert.equal(wrapper.find('.active a').props().href, '#addAdmin');
    });
  });

});
