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
  '../../../core/api',
  '../../databases/base',
  '../stores',
  '../resources',
  '../actions',
  '../../../../test/mocha/testUtils',
  'sinon'
], function (FauxtonAPI, Databases, Stores, Permissions, Actions, testUtils, sinon) {
  var assert = testUtils.assert;
  var restore = testUtils.restore;
  var store = Stores.permissionsStore;

  describe('Permissions Actions', function () {
    var getSecuritystub;

    beforeEach(function () {
      var databaseName = 'permissions-test';
      var database = new Databases.Model({ id: databaseName });
      Actions.editPermissions(
        database,
        new Permissions.Security(null, {
          database: database
        })
      );


      var promise = FauxtonAPI.Deferred();
      getSecuritystub = sinon.stub(store, 'getSecurity');
      getSecuritystub.returns({
        canAddItem: function () { return {error: true};},
        save: function () {
          return promise;
        }
      });
    });

    afterEach(function () {
      restore(store.getSecurity);
    });

    describe('add Item', function () {

      afterEach(function () {
        restore(FauxtonAPI.addNotification);
        restore(Actions.savePermissions);
        restore(store.getSecurity);
      });

      it('does not save item if cannot add it', function () {
        var spy = sinon.spy(FauxtonAPI, 'addNotification');
        var spy2 = sinon.spy(Actions, 'savePermissions');

        Actions.addItem({
          value: 'boom',
          type: 'names',
          section: 'members'
        });

        assert.ok(spy.calledOnce);
        assert.notOk(spy2.calledOnce);
      });

      it('save items', function () {
        var spy = sinon.spy(FauxtonAPI, 'addNotification');
        var spy2 = sinon.spy(Actions, 'savePermissions');

        var promise = FauxtonAPI.Deferred();
        getSecuritystub.returns({
          canAddItem: function () { return {error: false};},
          save: function () {
            return promise;
          }
        });

        Actions.addItem({
          value: 'boom',
          type: 'names',
          section: 'members'
        });

        assert.ok(spy2.calledOnce);
        assert.notOk(spy.calledOnce);
      });
    });

    describe('remove item', function () {

      afterEach(function () {
        restore(Actions.savePermissions);
      });

      it('saves item', function () {
        Actions.addItem({
          value: 'boom',
          type: 'names',
          section: 'members'
        });

        var spy = sinon.spy(Actions, 'savePermissions');

        Actions.removeItem({
          value: 'boom',
          type: 'names',
          section: 'members'
        });

        assert.ok(spy.calledOnce);
      });

    });
  });
});
