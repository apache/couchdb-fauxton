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
import Databases from "../../databases/base";
import Permissions from "../resources";
import Views from "../components.react";
import Actions from "../actions";
import utils from "../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import sinon from "sinon";
import { mount } from 'enzyme';
var assert = utils.assert;
var restore = utils.restore;

FauxtonAPI.router = new FauxtonAPI.Router([]);

describe('Permissions Components', () => {

  beforeEach(() => {
    var savePermissionsStub = sinon.stub(Actions, 'savePermissions');
  });

  afterEach(() => {
    restore(Actions.savePermissions);
  });

  describe('Permissions Controller', () => {
    afterEach(() => {
      restore(Actions.addItem);
      restore(Actions.removeItem);
    });

    it('on Add triggers add action', () => {
      var spy = sinon.spy(Actions, 'addItem');
      const el = mount(<Views.PermissionsController />);
      el.instance().addItem({});
      assert.ok(spy.calledOnce);
    });

    it('on Remove triggers remove action', () => {
      var spy = sinon.spy(Actions, 'removeItem');
      const el = mount(<Views.PermissionsController />);
      el.instance().removeItem({
        value: 'boom',
        type: 'names',
        section: 'members'
      });
      assert.ok(spy.calledOnce);
    });

  });

  describe('PermissionsSection', () => {

    it('adds user on submit', () => {
      const addSpy = sinon.spy();
      const el = mount(<Views.PermissionsSection section={'members'} roles={[]} names={[]} addItem={addSpy} />);
      el.find('.permissions-add-user input').simulate('change', {
        target: {
          value: 'newusername'
        }
      });

      el.find('.permissions-add-user').simulate('submit');

      var options = addSpy.args[0][0];
      assert.ok(addSpy.calledOnce);
      assert.equal(options.type, "names");
      assert.equal(options.section, "members");
    });

    it('adds role on submit', () => {
      const addSpy = sinon.spy();
      const el = mount(<Views.PermissionsSection section={'members'} roles={[]} names={[]} addItem={addSpy} />);

      el.find('.permissions-add-role input').simulate('change', {
        target: {
          value: 'newrole'
        }
      });

      el.find('.permissions-add-role').simulate('submit');

      var options = addSpy.args[0][0];
      assert.ok(addSpy.calledOnce);
      assert.equal(options.type, "roles");
      assert.equal(options.section, "members");
    });

    it('stores new name on change', () => {
      const addSpy = sinon.spy();
      var newName = 'newName';
      const el = mount(<Views.PermissionsSection section={'members'} roles={[]} names={[]} addItem={addSpy} />);
      el.find('.permissions-add-user .item').simulate('change', {
        target: {
          value: newName
        }
      });

      assert.equal(el.state().newName, newName);
    });

    it('stores new role on change', () => {
      var newRole = 'newRole';
      const addSpy = sinon.spy();
      const el = mount(<Views.PermissionsSection section={'members'} roles={[]} names={[]} addItem={addSpy} />);
      el.find('.permissions-add-role .item').simulate('change', {
        target: {
          value: newRole
        }
      });
      assert.equal(el.state().newRole, newRole);
    });
  });

  describe('PermissionsItem', () => {

    it('triggers remove on click', () => {
      const removeSpy = sinon.spy();
      const el = mount(<Views.PermissionsItem section={'members'} item={'test-item'} removeItem={removeSpy} />);
      el.find('.close').simulate('click');
      assert.ok(removeSpy.calledOnce);
    });
  });
});
