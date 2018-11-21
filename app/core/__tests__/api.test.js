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

import FauxtonAPI from "../api";

describe('URLs', () => {

  it('can register and get url', () => {
    const testUrl = 'this_is_a_test_url';

    FauxtonAPI.registerUrls('testURL', {
      server: () => {
        return testUrl;
      }
    });

    expect(FauxtonAPI.urls('testURL', 'server')).toBe(testUrl);

  });

  it('can register interceptor to change url', () => {
    const testUrl = 'interceptor_url';

    FauxtonAPI.registerExtension('urls:interceptors', function (name, context) {
      if (name === 'testURL' && context === 'intercept') {
        return testUrl;
      }

      return false;
    });

    expect(FauxtonAPI.urls('testURL', 'intercept')).toBe(testUrl);
  });

});
