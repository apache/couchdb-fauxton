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

import Backbone from 'backbone';
import sinon from 'sinon';
import Documents from '../shared-resources';

describe('Documents.Doc large integer round-trip', () => {
  const BIG_INT = '9223372036854775807';
  const ROUNDED = '9223372036854776000';
  let ajaxStub;

  afterEach(() => {
    if (ajaxStub) {
      ajaxStub.restore();
    }
  });

  const makeDoc = () => {
    const doc = new Documents.Doc(
      { _id: 'large-int-test' },
      { database: { id: 'db', safeID: () => 'db' } }
    );
    doc.url = () => '/db/large-int-test';
    return doc;
  };

  it('reads and writes an integer beyond MAX_SAFE_INTEGER without rounding it', () => {
    const responseBody = `{"_id":"large-int-test","_rev":"1-abc","hugeNumber":${BIG_INT}}`;
    let sentBody;

    ajaxStub = sinon.stub(Backbone, 'ajax').callsFake((params) => {
      if (params.type === 'GET') {
        params.success(responseBody);
      } else {
        sentBody = params.data;
        params.success({ ok: true, id: 'large-int-test', rev: '2-def' });
      }
      return { done() {}, fail() {} };
    });

    const doc = makeDoc();

    doc.fetch();
    expect(doc.get('hugeNumber').toString()).toEqual(BIG_INT);
    expect(doc.prettyJSON()).toContain(BIG_INT);

    doc.save();
    expect(sentBody).toContain(BIG_INT);
    expect(sentBody).not.toContain(ROUNDED);
  });
});
