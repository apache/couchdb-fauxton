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
  'testUtils',
  'core/utils'
], function (FauxtonAPI, testUtils, utils) {
  var assert = testUtils.assert;

  describe('Utils', function () {

    describe('localStorage', function () {

      it('Should get undefined when getting a non-existent key', function () {
        assert.isUndefined(utils.localStorageGet('qwerty'));
      });

      it ('Should get value after setting it', function () {
        var key = 'key1';
        utils.localStorageSet(key, 1);
        assert.equal(utils.localStorageGet(key), 1);
      });

      it ('Set and retrieve complex object', function () {
        var key = 'key2',
          obj = {
            one: 1,
            two: ['1', 'string', 3]
          };
        utils.localStorageSet(key, obj);
        assert.deepEqual(utils.localStorageGet(key), obj);
      });
    });

    describe('sessionStorage', function () {

      it('returns null when getting a non-existent key', function () {
        assert.isNull(utils.sessionStorageGet('qwerty'));
      });

      it('Should get value after setting it', function () {
        utils.sessionStorageSet('key1', 1);
        assert.equal(utils.sessionStorageGet('key1'), 1);
      });

      it('Set and retrieve complex object', function () {
        var key = 'key2',
          obj = {
            one: 1,
            two: ['1', 'string', 3]
          };
        utils.sessionStorageSet(key, obj);
        assert.deepEqual(utils.sessionStorageGet(key), obj);
      });
    });
  });

});
