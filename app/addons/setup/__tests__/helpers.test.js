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

import {isInvalid} from '../helpers';

describe('Setup - Helpers', () => {

  const validData = {
    username: 'foo',
    password: 'bar',
    bind_address: '0.0.0.0',
    singlenode: false,
    port: 5984,
    nodeCount: 3
  };

  describe('isInvalid', () => {

    it('should return an error if no username is define', () => {
      let data = Object.assign({}, validData);
      data.username = '';
      expect(isInvalid(data)).toBe('Admin name is required');
    });

    it('should return an error if password not set', () => {
      let data = Object.assign({}, validData);
      data.password = '';
      expect(isInvalid(data)).toBe('Admin password is required');
    });

    it('should return an error if bind address is 127.0.0.1', () => {
      let data = Object.assign({}, validData);
      data.bind_address = '127.0.0.1';
      expect(isInvalid(data)).toBe('Bind address can not be 127.0.0.1');
    });

    it('should return error if port is not a number', () => {
      let data = Object.assign({}, validData);
      data.port = 'foo';
      expect(isInvalid(data)).toBe('Bind port must be a number');
    });

    it('should return error if node count is not a number', () => {

      let data = Object.assign({}, validData);
      data.nodeCount = 'foo';
      expect(isInvalid(data)).toBe('Node count must be a number');
    });

    it('should return error if node counter is lower than 1', () => {
      let data = Object.assign({}, validData);
      data.nodeCount = 0;
      expect(isInvalid(data)).toBe('Node count must be >= 1');
    });

    it('should return false if valid', () => {
      expect(isInvalid(validData)).toBe(false);
    });

  });
});
