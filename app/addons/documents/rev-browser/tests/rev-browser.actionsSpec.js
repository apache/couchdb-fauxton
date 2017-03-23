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

import RevActions from "../rev-browser.actions";
import fixtures from "./fixtures";
import utils from "../../../../../test/mocha/testUtils";

const assert = utils.assert;

describe('RevActions', () => {


  it('getConflictingRevs gets the revisions which are obsolete, winner', () => {

    const res = RevActions.getConflictingRevs(
      fixtures.threePaths.paths,
      "7-1f1bb5806f33c8922277ea053d6fc4ed",
      Object.keys({})
    );

    const expected = [
      "5-5555f2429e2211f74e656663f39b0cb8",
      "7-1309b41d34787f7ba95280802f327dc2"
    ];

    assert.deepEqual(expected, res);
  });

  it('getConflictingRevs gets the revisions which are obsolete, sidetrack with a lot lower rev', () => {

    const res = RevActions.getConflictingRevs(
      fixtures.threePaths.paths,
      "5-5555f2429e2211f74e656663f39b0cb8",
      Object.keys({})
    );

    const expected = [
      "7-1309b41d34787f7ba95280802f327dc2",
      "7-1f1bb5806f33c8922277ea053d6fc4ed"
    ];

    assert.deepEqual(expected, res);
  });

  it('getConflictingRevs filters out deleted revisions', () => {

    const res = RevActions.getConflictingRevs(
      fixtures.threePaths.paths,
      "5-5555f2429e2211f74e656663f39b0cb8",
      Object.keys({ '7-1f1bb5806f33c8922277ea053d6fc4ed': true })
    );

    const expected = [
      "7-1309b41d34787f7ba95280802f327dc2"
    ];

    assert.deepEqual(expected, res);
  });

  it('buildBulkDeletePayload prepares the payload for bulkdocs', () => {

    const data = [
      "7-1309b41d34787f7ba95280802f327dc2",
      "6-9831e318304c35efafa6faa57a54809f",
      "5-8eadb1a781b835cce132a339250bba53",
      "4-3c1720cc9f559444f7e717a070f8eaec",
      "7-1f1bb5806f33c8922277ea053d6fc4ed"
    ];

    const res = RevActions.buildBulkDeletePayload('fooId', data);

    assert.deepEqual([
      { "_id": "fooId", "_rev": "7-1309b41d34787f7ba95280802f327dc2", "_deleted": true },
      { "_id": "fooId", "_rev": "6-9831e318304c35efafa6faa57a54809f", "_deleted": true },
      { "_id": "fooId", "_rev": "5-8eadb1a781b835cce132a339250bba53", "_deleted": true },
      { "_id": "fooId", "_rev": "4-3c1720cc9f559444f7e717a070f8eaec", "_deleted": true },
      { "_id": "fooId", "_rev": "7-1f1bb5806f33c8922277ea053d6fc4ed", "_deleted": true },
    ], res.docs);
  });
});
