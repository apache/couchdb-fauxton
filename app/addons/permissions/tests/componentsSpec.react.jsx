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
  'addons/databases/base',
  'addons/permissions/resources',
  'addons/permissions/components.react',
  'addons/permissions/actions',
  'testUtils',
  "react"
  ], function (FauxtonAPI, Databases, Permissions, Views, Actions, utils, React) {
    var assert = utils.assert;
    var restore = utils.restore;
    var TestUtils = React.addons.TestUtils;

    describe('Permissions Components', function () {

      beforeEach(function () {
        var databaseName = 'permissions-test';
        var database = new Databases.Model({ id: databaseName });
        Actions.editPermissions(
          database,
          new Permissions.Security(null, {
            database: database
          })
        );

        var savePermissionsStub = sinon.stub(Actions, 'savePermissions');
      });

      afterEach(function () {
        restore(Actions.savePermissions);
      });

      describe('Permissions Controller', function () {
        var el, container;

        beforeEach(function () {
          container = document.createElement('div');
          el = TestUtils.renderIntoDocument(<Views.PermissionsController />, container);
        });

        afterEach(function () {
          React.unmountComponentAtNode(container);
        });

        it('on Add triggers add action', function () {
          var spy = sinon.spy(Actions, 'addItem');
          el.addItem({});
          assert.ok(spy.calledOnce);
        });

        it('on Remove triggers remove action', function () {
          var spy = sinon.spy(Actions, 'removeItem');
          el.removeItem({
            value: 'boom',
            type: 'names',
            section: 'members'
          });
          assert.ok(spy.calledOnce);
        });

      });

      describe('PermissionsSection', function () {
        var el, container, addSpy;

        beforeEach(function () {
          addSpy = sinon.spy();
          container = document.createElement('div');
          el = TestUtils.renderIntoDocument(<Views.PermissionsSection section={'members'} roles={[]} names={[]} addItem={addSpy} />, container);
        });

        afterEach(function () {
          React.unmountComponentAtNode(container);
        });

        it('adds user on submit', function () {
          var input = $(el.getDOMNode()).find('input')[0];
          TestUtils.Simulate.change(input, {
            target: {
              value: 'newusername'
            }
          });
          var form = $(el.getDOMNode()).find('.permission-item-form')[0];
          TestUtils.Simulate.submit(form);

          var options = addSpy.args[0][0];
          assert.ok(addSpy.calledOnce);
          assert.equal(options.type, "names");
          assert.equal(options.section, "members");
        });

        it('adds role on submit', function () {
          var input = $(el.getDOMNode()).find('input')[1];
          TestUtils.Simulate.change(input, {
            target: {
              value: 'newrole'
            }
          });
          var form = $(el.getDOMNode()).find('.permission-item-form')[1];
          TestUtils.Simulate.submit(form);

          var options = addSpy.args[0][0];
          assert.ok(addSpy.calledOnce);
          assert.equal(options.type, "roles");
          assert.equal(options.section, "members");
        });

        it('stores new name on change', function () {
          var newName = 'newName';
          var dom = $(el.getDOMNode()).find('.item')[0];

          TestUtils.Simulate.change(dom, {
            target: {
              value: newName
            }
          });

          assert.equal(el.state.newName, newName);
        });

        it('stores new role on change', function () {
          var newRole = 'newRole';
          var dom = $(el.getDOMNode()).find('.item')[1];

          TestUtils.Simulate.change(dom, {
            target: {
              value: newRole
            }
          });

          assert.equal(el.state.newRole, newRole);
        });
      });

      describe('PermissionsItem', function () {
        var el, container, removeSpy;

        beforeEach(function () {
          removeSpy = sinon.spy();
          container = document.createElement('div');
          el = TestUtils.renderIntoDocument(<Views.PermissionsItem section={'members'} item={'test-item'} removeItem={removeSpy} />, container);
        });

        afterEach(function () {
          React.unmountComponentAtNode(container);
        });

        it('triggers remove on click', function () {
          var dom = $(el.getDOMNode()).find('.close')[0];
          TestUtils.Simulate.click(dom);

          assert.ok(removeSpy.calledOnce);

        });

      });
    });
  });
