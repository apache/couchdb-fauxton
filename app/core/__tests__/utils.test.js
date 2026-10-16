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

import utils from "../utils";

describe('Utils', () => {

  describe('getDocTypeFromId', () => {

    it('returns doc if id not given', () => {
      const res = utils.getDocTypeFromId();
      expect(res).toBe('doc');
    });

    it('returns design doc for design docs', () => {
      const res = utils.getDocTypeFromId('_design/foobar');
      expect(res).toBe('design doc');
    });

    it('returns doc for all others', () => {
      const res = utils.getDocTypeFromId('blerg');
      expect(res).toBe('doc');
    });
  });

  describe('getSafeIdForDoc', () => {

    it('keeps _design/ intact', () => {
      const res = utils.getSafeIdForDoc('_design/foo/do');
      expect(res).toBe('_design/foo%2Fdo');
    });

    it('encodes all other', () => {
      const res = utils.getSafeIdForDoc('_redesign/foobar');
      expect(res).toBe('_redesign%2Ffoobar');
    });
  });

  describe('safeURLName', () => {

    it('encodes special chars', () => {
      expect(utils.safeURLName('foo-bar/baz')).toBe('foo-bar%2Fbaz');
    });

    it('encodes an encoded doc', () => {
      expect(utils.safeURLName('foo-bar%2Fbaz')).toBe('foo-bar%252Fbaz');
    });
  });

  describe('isSystemDatabase', () => {

    it('detects system databases', () => {
      expect(utils.isSystemDatabase('_replicator')).toBeTruthy();
    });

    it('ignores other dbs', () => {
      expect(utils.isSystemDatabase('foo')).toBeFalsy();
    });
  });

  describe('localStorage', () => {

    it('Should get undefined when getting a non-existent key', () => {
      expect(utils.localStorageGet('qwerty')).not.toBeDefined();
    });

    it('Should get value after setting it', () => {
      const key = 'key1';
      utils.localStorageSet(key, 1);
      expect(utils.localStorageGet(key)).toBe(1);
    });

    it('Set and retrieve complex object', () => {
      const key = 'key2',
            obj = {
              one: 1,
              two: ['1', 'string', 3]
            };
      utils.localStorageSet(key, obj);
      expect(utils.localStorageGet(key)).toEqual(obj);
    });

    it('stripHTML removes HTML', () => {
      [
        { html: '<span>okay</span>', text: 'okay' },
        { html: 'test <span>before</span> and after', text: 'test before and after' },
        { html: 'testing <a href="#whatever">attributes</span>', text: 'testing attributes' },
        { html: '<span>testing</span> multiple <p>elements</p>', text: 'testing multiple elements' }
      ].forEach(function (item) {
        expect(utils.stripHTML(item.html)).toBe(item.text);
      });
    });

  });

  describe('queryParams', () => {
    it('builds query string from an object', () => {
      expect(utils.queryParams({
        startkey: JSON.stringify('_design/app'),
        endkey: JSON.stringify('_design/app\u9999'),
        limit:30
      })).toBe(
        'startkey=%22_design%2Fapp%22&endkey=%22_design%2Fapp%E9%A6%99%22&limit=30'
      );
    });
  });

  describe('isLocalDevelopment', () => {
    it('returns true for localhost', () => {
      expect(utils.isLocalDevelopment('localhost')).toBe(true);
    });

    it('returns true for 127.0.0.1', () => {
      expect(utils.isLocalDevelopment('127.0.0.1')).toBe(true);
    });

    it('returns true for IPv6 localhost [::1]', () => {
      expect(utils.isLocalDevelopment('[::1]')).toBe(true);
    });

    it('returns true for .local domains', () => {
      expect(utils.isLocalDevelopment('myapp.local')).toBe(true);
      expect(utils.isLocalDevelopment('test.local')).toBe(true);
      expect(utils.isLocalDevelopment('dev.mycompany.local')).toBe(true);
    });

    it('returns false for production domains', () => {
      expect(utils.isLocalDevelopment('example.com')).toBe(false);
      expect(utils.isLocalDevelopment('app.example.com')).toBe(false);
      expect(utils.isLocalDevelopment('couchdb.apache.org')).toBe(false);
    });

    it('returns false for IP addresses that are not localhost', () => {
      expect(utils.isLocalDevelopment('203.0.113.1')).toBe(false);
      expect(utils.isLocalDevelopment('192.168.1.1')).toBe(false);
      expect(utils.isLocalDevelopment('10.0.0.1')).toBe(false);
    });

    it('returns false for domains ending with "local" but not .local TLD', () => {
      expect(utils.isLocalDevelopment('mylocal.com')).toBe(false);
      expect(utils.isLocalDevelopment('localhost.com')).toBe(false);
    });
  });
});
