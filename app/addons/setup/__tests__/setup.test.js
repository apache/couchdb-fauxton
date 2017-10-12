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
import Resources from "../resources";
import testUtils from "../../../../test/mocha/testUtils";
var assert = testUtils.assert,
    model;

describe('Setup: verify input', () => {

  beforeEach(() => {
    model = new Resources.Model();
  });

  it('You have to set a username', () => {
    const error = model.validate({
      admin: {
        user: '',
        password: 'ente'
      }
    });

    assert.ok(error);
  });

  it('You have to set a password', () => {
    const error = model.validate({
      admin: {
        user: 'rocko',
        password: ''
      }
    });

    assert.ok(error);
  });

  it('Port must be a number, if defined', () => {
    const error = model.validate({
      admin: {
        user: 'rocko',
        password: 'ente'
      },
      port: 'port'
    });

    assert.ok(error);
  });

  it('Bind address can not be 127.0.0.1', () => {
    const error = model.validate({
      admin: {
        user: 'rocko',
        password: 'ente'
      },
      bind_address: '127.0.0.1'
    });

    assert.ok(error);
  });

  it('Node count must be a number', () => {
    const error = model.validate({
      admin: {
        user: 'rocko',
        password: 'ente'
      },
      nodeCount: 'abc'
    });
    assert.ok(error);
  });

  it('Node count must be >= 1', () => {
    const error = model.validate({
      admin: {
        user: 'rocko',
        password: 'ente'
      },
      nodeCount: 0
    });
    assert.ok(error);
  });

});
