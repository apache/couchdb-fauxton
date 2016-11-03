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
  setPermissionOnObject,
  deletePermissionFromObject
} from '../actions';


describe('Permissions Actions', () => {

  describe('deleting roles', () => {
    it('throws if a role is not in permissions', () => {
      const p = {
        admins: {
          names: ['abc'],
          roles: []
        },
        members: {
          names: [],
          roles: []
        }
      };

      expect(() => {
        deletePermissionFromObject(p, 'admins', 'names', 'pizza');
      }).toThrow();
    });

    it('deletes roles', () => {
      const p = {
        admins: {
          names: ['abc', 'furbie'],
          roles: []
        },
        members: {
          names: [],
          roles: []
        }
      };

      const res = deletePermissionFromObject(p, 'admins', 'names', 'abc');

      expect(res).toEqual({
        admins: {
          names: ['furbie'],
          roles: []
        },
        members: {
          names: [],
          roles: []
        }
      });
    });

  });

  describe('adding roles', () => {
    it('throws if a role is already in permissions', () => {
      const p = {
        admins: {
          names: ['abc'],
          roles: []
        },
        members: {
          names: [],
          roles: []
        }
      };

      expect(() => {
        setPermissionOnObject(p, 'admins', 'names', 'abc');
      }).toThrow();
    });

    it('adds if not already present', () => {
      const p = {
        admins: {
          names: ['abc'],
          roles: []
        },
        members: {
          names: [],
          roles: []
        }
      };

      const res = setPermissionOnObject(p, 'admins', 'names', 'test123');

      expect(res).toEqual({
        admins: {
          names: ['abc', 'test123'],
          roles: []
        },
        members: {
          names: [],
          roles: []
        }
      });
    });

  });
});
