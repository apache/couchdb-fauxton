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

import { shallow } from 'enzyme';
import {formatUrl} from '../components/common-table';

describe('Common Table Component', () => {

  describe("formatUrl", () => {

    beforeEach(() => {
      window.history.pushState({}, 'Test title', '/my-db');
    });

    it("renders a url with tricky password characters", () => {
      const url = "http://hello:h#$!^@localhost:8000/my-db";
      const el = shallow(formatUrl(url));
      expect(el.find('a').prop('href')).toBe('#/database/my-db/_all_docs');
    });

    it("renders a url with no password characters", () => {
      const url = "http://localhost:8000/my-db";
      const el = shallow(formatUrl(url));
      expect(el.find('a').prop('href')).toBe('#/database/my-db/_all_docs');
    });

    it('renders a with a default url if no url is supplied', () => {
      expect(formatUrl()).toBe('');
    });
  });
});
