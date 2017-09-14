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
import testUtils from "../../../test/mocha/testUtils";
import utils from "../utils";
const assert = testUtils.assert;

describe('Utils', () => {

  describe('getDocTypeFromId', () => {

    it('returns doc if id not given', () => {
      const res = utils.getDocTypeFromId();
      assert.equal(res, 'doc');
    });

    it('returns design doc for design docs', () => {
      const res = utils.getDocTypeFromId('_design/foobar');
      assert.equal(res, 'design doc');
    });

    it('returns doc for all others', () => {
      const res = utils.getDocTypeFromId('blerg');
      assert.equal(res, 'doc');
    });
  });

  describe('getSafeIdForDoc', () => {

    it('keeps _design/ intact', () => {
      const res = utils.getSafeIdForDoc('_design/foo/do');
      assert.equal(res, '_design/foo%2Fdo');
    });

    it('encodes all other', () => {
      const res = utils.getSafeIdForDoc('_redesign/foobar');
      assert.equal(res, '_redesign%2Ffoobar');
    });
  });

  describe('safeURLName', () => {

    it('encodes special chars', () => {
      assert.equal('foo-bar%2Fbaz', utils.safeURLName('foo-bar/baz'));
    });

    it('encodes an encoded doc', () => {
      assert.equal('foo-bar%252Fbaz', utils.safeURLName('foo-bar%2Fbaz'));
    });
  });

  describe('isSystemDatabase', () => {

    it('detects system databases', () => {
      assert.ok(utils.isSystemDatabase('_replicator'));
    });

    it('ignores other dbs', () => {
      assert.notOk(utils.isSystemDatabase('foo'));
    });
  });

  describe('localStorage', () => {

    it('Should get undefined when getting a non-existent key', () => {
      assert.isUndefined(utils.localStorageGet('qwerty'));
    });

    it ('Should get value after setting it', () => {
      const key = 'key1';
      utils.localStorageSet(key, 1);
      assert.equal(utils.localStorageGet(key), 1);
    });

    it ('Set and retrieve complex object', () => {
      const key = 'key2',
        obj = {
          one: 1,
          two: ['1', 'string', 3]
        };
      utils.localStorageSet(key, obj);
      assert.deepEqual(utils.localStorageGet(key), obj);
    });

    it ('stripHTML removes HTML', () => {
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
