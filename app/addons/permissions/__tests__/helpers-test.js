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
  isValueAlreadySet,
  addValueToPermissions
} from '../helpers';

describe('Permissions - Helpers', () => {

  describe('isValueAlreadySet', () => {

    it('returns false if object does not have properties', () => {

      let permissions = {};
      expect(
        isValueAlreadySet(permissions, 'admins', 'names', 'rocko')
      ).toBe(false);

      permissions = { admins: {} };
      expect(
        isValueAlreadySet(permissions, 'admins', 'names', 'rocko')
      ).toBe(false);

      permissions = { admins: { names: [] } };
      expect(
        isValueAlreadySet(permissions, 'admins', 'names', 'rocko')
      ).toBe(false);
    });

    it('confirms existing properties', () => {

      const permissions = { admins: { names: ['michelle', 'rocko', 'garren'] } };

      expect(
        isValueAlreadySet(permissions, 'admins', 'names', 'rocko')
      ).toBe(true);
    });

  });

  describe('addValueToPermissions', () => {

    it('adds values, even if properties not set', () => {

      const permissions = {};
      expect(
        addValueToPermissions(permissions, 'admins', 'names', 'rocko')
      ).toEqual({
        admins: {
          names: ['rocko']
        }
      });
    });

    it('adds values', () => {

      const permissions = {
        admins: {
          names: ['rocko']
        }
      };

      expect(
        addValueToPermissions(permissions, 'admins', 'names', 'garren')
      ).toEqual({
        admins: {
          names: ['rocko', 'garren']
        }
      });
    });

  });

});
