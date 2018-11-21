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
import ReactComponents from "../react-components";
import React from "react";
import {mount} from 'enzyme';

describe('PaddedBorderedBox', function () {
  let el;

  it('hosts child elements', function () {
    el = mount(
      <ReactComponents.PaddedBorderedBox>
        <div className="foo-children"></div>
      </ReactComponents.PaddedBorderedBox>
    );
    expect(el.find('.foo-children').length).toBeGreaterThan(0);
  });
});
