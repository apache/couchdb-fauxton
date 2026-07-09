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

import * as losslessJSON from '../lossless-json';

describe('lossless-json', () => {
  it('keeps integers larger than MAX_SAFE_INTEGER intact through a round-trip', () => {
    const text = '{"hugeNumber":9223372036854775807}';
    expect(losslessJSON.stringify(losslessJSON.parse(text))).toEqual(text);
  });

  it('does not round a large integer the way JSON.parse does', () => {
    const parsed = losslessJSON.parse('{"hugeNumber":9223372036854775807}');
    expect(parsed.hugeNumber.toString()).toEqual('9223372036854775807');
    expect(JSON.parse('{"hugeNumber":9223372036854775807}').hugeNumber)
      .toEqual(9223372036854776000);
  });

  it('leaves numbers within the safe range as plain numbers', () => {
    const parsed = losslessJSON.parse('{"count":42,"ratio":3.14}');
    expect(parsed.count).toEqual(42);
    expect(parsed.ratio).toEqual(3.14);
  });
});
