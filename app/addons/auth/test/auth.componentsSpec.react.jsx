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
  'api',
  'react',
  'testUtils',
  'addons/auth/components.react',
  'addons/auth/stores',
  'addons/auth/actions'
], function (FauxtonAPI, React, utils, Components, Stores, Actions) {
  var assert = utils.assert;

  var TestUtils = React.addons.TestUtils;
  var createAdminSidebarStore = Stores.createAdminSidebarStore;


  describe('Auth -- Components', function () {

    describe('LoginForm', function () {
      var container, loginForm;

      beforeEach(function () {
        container = document.createElement('div');
        loginForm = TestUtils.renderIntoDocument(<Components.LoginForm />, container);
      });

      afterEach(function () {
        React.unmountComponentAtNode(container);
      });

      it('should trigger login event when form submitted', function () {
        var spy = sinon.spy(Actions, 'login');
        TestUtils.Simulate.submit($(loginForm.getDOMNode()).find('#login')[0]);
        assert.ok(spy.calledOnce);
      });
    });

    describe('ChangePasswordForm', function () {
      var container, changePasswordForm;

      beforeEach(function () {
        container = document.createElement('div');
        changePasswordForm = TestUtils.renderIntoDocument(<Components.ChangePasswordForm />, container);
        utils.restore(Actions.changePassword);
      });

      afterEach(function () {
        React.unmountComponentAtNode(container);
      });

      it('should call action to update password on field change', function () {
        var spy = sinon.spy(Actions, 'updateChangePasswordField');
        TestUtils.Simulate.change($(changePasswordForm.getDOMNode()).find('#password')[0], { target: { value: 'bobsyouruncle' }});
        assert.ok(spy.calledOnce);
      });

      it('should call action to update password confirm on field change', function () {
        var spy = sinon.spy(Actions, 'updateChangePasswordConfirmField');
        TestUtils.Simulate.change($(changePasswordForm.getDOMNode()).find('#password-confirm')[0], { target: { value: 'hotdiggity' }});
        assert.ok(spy.calledOnce);
      });

      it('should call action to submit form', function () {
        var stub = sinon.stub(Actions, 'changePassword', function () {});
        TestUtils.Simulate.submit($(changePasswordForm.getDOMNode()).find('#change-password')[0]);
        assert.ok(stub.calledOnce);
      });
    });

    describe('CreateAdminForm', function () {
      var container, createAdminForm;

      beforeEach(function () {
        container = document.createElement('div');
        createAdminForm = TestUtils.renderIntoDocument(<Components.CreateAdminForm loginAfter={false} />, container);
      });

      afterEach(function () {
        React.unmountComponentAtNode(container);
      });

      it('should call action to update username on field change', function () {
        var spy = sinon.spy(Actions, 'updateCreateAdminUsername');
        TestUtils.Simulate.change($(createAdminForm.getDOMNode()).find('#username')[0], { target: { value: 'catsmeow' }});
        assert.ok(spy.calledOnce);
      });

      it('should call action to update password confirm on field change', function () {
        var spy = sinon.spy(Actions, 'updateCreateAdminPassword');
        TestUtils.Simulate.change($(createAdminForm.getDOMNode()).find('#password')[0], { target: { value: 'topnotch' }});
        assert.ok(spy.calledOnce);
      });
    });

    describe('CreateAdminSidebar', function () {
      var container, createAdminSidebar;

      beforeEach(function () {
        createAdminSidebarStore.reset();
        container = document.createElement('div');
        createAdminSidebar = TestUtils.renderIntoDocument(<Components.CreateAdminSidebar />, container);
      });

      afterEach(function () {
        React.unmountComponentAtNode(container);
      });

      it('confirm the default selected nav item is the change pwd page', function () {
        assert.equal($(createAdminSidebar.getDOMNode()).find('.active').find('a').attr('href'), '#changePassword');
      });

      it('confirm clicking a sidebar nav item selects it in the DOM', function () {
        TestUtils.Simulate.click($(createAdminSidebar.getDOMNode()).find('li[data-page="addAdmin"]').find('a')[0]);
        assert.equal($(createAdminSidebar.getDOMNode()).find('.active').find('a').attr('href'), '#addAdmin');
      });
    });

  });

});
