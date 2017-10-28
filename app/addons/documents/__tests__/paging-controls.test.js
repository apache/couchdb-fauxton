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

import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import PagingControls from '../index-results/components/pagination/PagingControls';

describe('PagingControls', () => {
  it('pagination controls disabled when canShowPrevious and canShowNext are false', () => {
    const wrapper = mount(<PagingControls
      canShowNext={false}
      canShowPrevious={false}
      nextClicked={() => {}}
      previousClicked={() => {}}
    />);

    expect(wrapper.find('ul.pagination li.disabled').length).toBe(2);
  });

  it('pagination control disabled when canShowPrevious is false', () => {
    const wrapper = mount(<PagingControls
      canShowNext={true}
      canShowPrevious={false}
      nextClicked={() => {}}
      previousClicked={() => {}}
    />);

    expect(wrapper.find('ul.pagination li.disabled #previous').length).toBe(1);
  });

  it('pagination control disabled when canShowNext is false', () => {
    const wrapper = mount(<PagingControls
      canShowNext={false}
      canShowPrevious={true}
      nextClicked={() => {}}
      previousClicked={() => {}}
    />);

    expect(wrapper.find('ul.pagination li.disabled #next').length).toBe(1);
  });

  it('pagination controls enabled when canShowPrevious and canShowNext are true', () => {
    const wrapper = mount(<PagingControls
      canShowNext={true}
      canShowPrevious={true}
      nextClicked={() => {}}
      previousClicked={() => {}}
    />);

    expect(wrapper.find('ul.pagination li.disabled').length).toBe(0);
  });
});
