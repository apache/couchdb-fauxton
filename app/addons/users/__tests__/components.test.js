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

import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import utils from '../../../../test/mocha/testUtils';
import FauxtonAPI from '../../../core/api';
import NewUserForm from '../components/NewUserForm';
import RolesEditor from '../components/RolesEditor';

const { restore } = utils;

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

const fillForm = (wrapper, {name = 'test', password = 'password', confirm = password} = {}) => {
  wrapper.find('input#new-user-name').simulate('change', {target: {value: name}});
  wrapper.find('input#new-user-password').simulate('change', {target: {value: password}});
  wrapper.find('input#new-user-password-confirm').simulate('change', {target: {value: confirm}});
};

describe('Users Components', () => {

  describe('RolesEditor', () => {

    it('adds a valid role', () => {
      const onChange = sinon.stub();
      const wrapper = mount(<RolesEditor roles={['reader']} onChange={onChange} />);

      wrapper.find('input#new-user-role').simulate('change', {target: {value: ' editor '}});
      wrapper.find('button[aria-label="Add role"]').simulate('click');
      sinon.assert.calledWith(onChange, ['reader', 'editor']);
    });

    it('adds a role when pressing Enter', () => {
      const onChange = sinon.stub();
      const wrapper = mount(<RolesEditor roles={[]} onChange={onChange} />);

      wrapper.find('input#new-user-role').simulate('change', {target: {value: 'editor'}});
      wrapper.find('input#new-user-role').simulate('keydown', {key: 'Enter'});
      sinon.assert.calledWith(onChange, ['editor']);
    });

    it('shows an error and does not add a system role', () => {
      const onChange = sinon.stub();
      const wrapper = mount(<RolesEditor roles={[]} onChange={onChange} />);

      wrapper.find('input#new-user-role').simulate('change', {target: {value: '_admin'}});
      wrapper.find('button[aria-label="Add role"]').simulate('click');
      sinon.assert.notCalled(onChange);
      expect(wrapper.find('.invalid-feedback').text()).toMatch(/System roles/);
    });

    it('removes a role', () => {
      const onChange = sinon.stub();
      const wrapper = mount(<RolesEditor roles={['reader', 'editor']} onChange={onChange} />);

      wrapper.find('button[aria-label="Remove role reader"]').simulate('click');
      sinon.assert.calledWith(onChange, ['editor']);
    });
  });

  describe('NewUserForm', () => {

    afterEach(() => {
      restore(FauxtonAPI.addNotification);
    });

    it('disables the submit button until all required fields are filled', () => {
      const wrapper = mount(<NewUserForm checkUserExists={sinon.stub()} createUser={sinon.stub()} />);
      expect(wrapper.find('button#create-user').prop('disabled')).toBe(true);

      fillForm(wrapper);
      expect(wrapper.find('button#create-user').prop('disabled')).toBe(false);
    });

    it('shows the generated document ID', () => {
      const wrapper = mount(<NewUserForm checkUserExists={sinon.stub()} createUser={sinon.stub()} />);
      fillForm(wrapper, {name: 'jan'});
      expect(wrapper.find('small#new-user-doc-id').text()).toBe('Document ID: org.couchdb.user:jan');
    });

    it('creates the user with the expected payload', async () => {
      sinon.stub(FauxtonAPI, 'addNotification');
      const checkUserExists = sinon.stub().resolves(false);
      const createUser = sinon.stub().resolves({ok: true});
      const onUserCreated = sinon.stub();
      const wrapper = mount(<NewUserForm
        checkUserExists={checkUserExists}
        createUser={createUser}
        onUserCreated={onUserCreated} />);

      fillForm(wrapper);
      wrapper.find('input#new-user-role').simulate('change', {target: {value: 'editor'}});
      wrapper.find('button[aria-label="Add role"]').simulate('click');
      wrapper.find('button#create-user').simulate('click');
      await flushPromises();

      sinon.assert.calledWith(checkUserExists, 'test');
      sinon.assert.calledWith(createUser, {
        _id: 'org.couchdb.user:test',
        name: 'test',
        password: 'password',
        type: 'user',
        roles: ['editor']
      });
      sinon.assert.calledWith(onUserCreated, 'test');
    });

    it('does not create the user when the name is taken', async () => {
      const createUser = sinon.stub();
      const wrapper = mount(<NewUserForm checkUserExists={sinon.stub().resolves(true)} createUser={createUser} />);

      fillForm(wrapper);
      wrapper.find('button#create-user').simulate('click');
      await flushPromises();
      wrapper.update();

      sinon.assert.notCalled(createUser);
      expect(wrapper.find('.invalid-feedback').first().text()).toBe('A user named "test" already exists.');
    });

    it('does not submit invalid names or mismatched passwords', () => {
      const checkUserExists = sinon.stub().resolves(false);
      const createUser = sinon.stub();
      const wrapper = mount(<NewUserForm checkUserExists={checkUserExists} createUser={createUser} />);

      fillForm(wrapper, {name: '_test'});
      wrapper.find('button#create-user').simulate('click');
      expect(wrapper.find('.invalid-feedback').first().text()).toMatch(/underscore/);

      fillForm(wrapper, {name: 'test', password: 'a', confirm: 'b'});
      wrapper.find('button#create-user').simulate('click');
      expect(wrapper.text()).toMatch(/Passwords do not match/);

      sinon.assert.notCalled(checkUserExists);
      sinon.assert.notCalled(createUser);
    });

    it('shows the server error when creation fails', async () => {
      const spy = sinon.stub(FauxtonAPI, 'addNotification');
      const err = new Error('Only _admin may set roles');
      err.error = 'forbidden';
      const wrapper = mount(<NewUserForm
        checkUserExists={sinon.stub().resolves(false)}
        createUser={sinon.stub().rejects(err)} />);

      fillForm(wrapper);
      wrapper.find('button#create-user').simulate('click');
      await flushPromises();
      wrapper.update();

      sinon.assert.calledWithMatch(spy, {type: 'error', msg: 'Failed to create user. Reason: Only _admin may set roles'});
      expect(wrapper.find('button#create-user').prop('disabled')).toBe(false);
    });
  });
});
