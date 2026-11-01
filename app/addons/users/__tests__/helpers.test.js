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

import {
  buildUserDoc,
  getUserDocId,
  validatePassword,
  validateRole,
  validateUsername
} from '../helpers';

describe('Users helpers', () => {

  describe('validateUsername', () => {
    it('requires a name', () => {
      expect(validateUsername('')).toBe('Username is required.');
    });

    it('rejects names starting with an underscore', () => {
      expect(validateUsername('_admin')).toMatch(/underscore/);
    });

    it('rejects names containing a colon', () => {
      expect(validateUsername('foo:bar')).toMatch(/":" is not allowed/);
    });

    it('accepts valid names', () => {
      expect(validateUsername('test')).toBeNull();
      expect(validateUsername('john.doe@example.com')).toBeNull();
      expect(validateUsername('a_b')).toBeNull();
    });
  });

  describe('validateRole', () => {
    it('rejects empty roles', () => {
      expect(validateRole('')).toMatch(/empty/);
    });

    it('rejects system roles except _metrics', () => {
      expect(validateRole('_admin')).toMatch(/System roles/);
      expect(validateRole('_reader')).toMatch(/System roles/);
      expect(validateRole('_metrics')).toBeNull();
    });

    it('rejects duplicate roles', () => {
      expect(validateRole('editor', ['editor'])).toMatch(/already been added/);
    });

    it('accepts valid roles', () => {
      expect(validateRole('editor', ['reader'])).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('requires a password', () => {
      expect(validatePassword('', '')).toBe('Password is required.');
    });

    it('requires both passwords to match', () => {
      expect(validatePassword('secret', 'secrex')).toBe('Passwords do not match.');
      expect(validatePassword('secret', 'secret')).toBeNull();
    });
  });

  describe('buildUserDoc', () => {
    it('builds the doc expected by _design/_auth', () => {
      expect(buildUserDoc({name: 'test', password: 'password', roles: []})).toEqual({
        _id: 'org.couchdb.user:test',
        name: 'test',
        password: 'password',
        type: 'user',
        roles: []
      });
    });

    it('derives the _id from the name', () => {
      expect(getUserDocId('jan')).toBe('org.couchdb.user:jan');
      expect(buildUserDoc({name: 'jan', password: 'x', roles: ['a', 'b']}).roles).toEqual(['a', 'b']);
    });
  });
});
