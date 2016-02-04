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
  '../api',
  '../../../test/mocha/testUtils',
  '../utils'
], function (FauxtonAPI, testUtils, utils) {
  var assert = testUtils.assert;

  describe('Utils', function () {

    describe('getDocTypeFromId', function () {

      it('returns doc if id not given', function () {
        var res = utils.getDocTypeFromId();
        assert.equal(res, 'doc');
      });

      it('returns design doc for design docs', function () {
        var res = utils.getDocTypeFromId('_design/foobar');
        assert.equal(res, 'design doc');
      });

      it('returns doc for all others', function () {
        var res = utils.getDocTypeFromId('blerg');
        assert.equal(res, 'doc');
      });
    });

    describe('getSafeIdForDoc', function () {

      it('keeps _design/ intact', function () {
        var res = utils.getSafeIdForDoc('_design/foo/do');
        assert.equal(res, '_design/foo%2Fdo');
      });

      it('encodes all other', function () {
        var res = utils.getSafeIdForDoc('_redesign/foobar');
        assert.equal(res, '_redesign%2Ffoobar');
      });
    });

    describe('isSystemDatabase', function () {

      it('detects system databases', function () {
        assert.ok(utils.isSystemDatabase('_replicator'));
      });

      it('ignores other dbs', function () {
        assert.notOk(utils.isSystemDatabase('foo'));
      });
    });

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

      it ('stripHTML removes HTML', function () {
        [
          { html: '<span>okay</span>', text: 'okay' },
          { html: 'test <span>before</span> and after', text: 'test before and after' },
          { html: 'testing <a href="#whatever">attributes</span>', text: 'testing attributes' },
          { html: '<span>testing</span> multiple <p>elements</p>', text: 'testing multiple elements' }
        ].forEach(function (item) {
          assert.equal(utils.stripHTML(item.html), item.text);
        });
      });

    });
  });

});
