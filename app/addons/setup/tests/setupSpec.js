// Licensed under the Apache License, Version 2.0 (the 'License'); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.
define([
  '../../../core/api',
  '../resources',
  '../../../../test/mocha/testUtils'
], function (FauxtonAPI, Resources, testUtils) {
  var assert = testUtils.assert,
      ViewSandbox = testUtils.ViewSandbox,
      model;

  describe('Setup: verify input', function () {

    beforeEach(function () {
      model = new Resources.Model();
    });

    it('You have to set a username', function () {
      var error = model.validate({
        admin: {
          user: '',
          password: 'ente'
        }
      });

      assert.ok(error);
    });

    it('You have to set a password', function () {
      var error = model.validate({
        admin: {
          user: 'rocko',
          password: ''
        }
      });

      assert.ok(error);
    });

    it('Port must be a number, if defined', function () {
      var error = model.validate({
        admin: {
          user: 'rocko',
          password: 'ente'
        },
        port: 'port'
      });

      assert.ok(error);
    });

    it('Bind address can not be 127.0.0.1', function () {
      var error = model.validate({
        admin: {
          user: 'rocko',
          password: 'ente'
        },
        bind_address: '127.0.0.1'
      });

      assert.ok(error);
    });

  });
});
