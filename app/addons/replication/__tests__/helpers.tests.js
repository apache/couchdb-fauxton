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

import helpers from '../helpers';

describe('Replication Helpers - getDatabaseLabel', () => {

  it('returns database name for string', () => {
    const db = 'http://tester:testerpass@127.0.0.1/db/fancy%2Fdb%2Fname';

    const res = helpers.getDatabaseLabel(db);

    expect(res).toBe('fancy%2Fdb%2Fname');
  });

  it('returns database name for object', () => {
    const db = {
      url: 'http://tester:testerpass@127.0.0.1/fancy'
    };

    const res = helpers.getDatabaseLabel(db);
    expect(res).toBe('fancy');
  });

});
