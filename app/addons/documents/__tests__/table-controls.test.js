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
import TableControls from '../index-results/components/pagination/TableControls';
import sinon from 'sinon';

describe('TableControls', () => {
  it('shows range of columns when not all are shown', () => {
    const wrapper = mount(<TableControls
      prioritizedEnabled={false}
      displayedFields={{shown: 5, allFieldCount: 10}}
      toggleShowAllColumns={() => {}}
    />);

    expect(wrapper.find('.shown-fields').text()).toMatch('Showing 5 of 10 columns.');
  });

  it('shows custom text when all columns are shown', () => {
    const wrapper = mount(<TableControls
      prioritizedEnabled={false}
      displayedFields={{shown: 5, allFieldCount: 5}}
      toggleShowAllColumns={() => {}}
    />);

    expect(wrapper.find('.shown-fields').text()).toMatch('Showing 5 columns.');
  });

  it('shows custom text when all columns are shown', () => {
    const spy = sinon.spy();
    const wrapper = mount(<TableControls
      prioritizedEnabled={false}
      displayedFields={{shown: 5, allFieldCount: 5}}
      toggleShowAllColumns={spy}
    />);

    wrapper.find('#footer-doc-control-prioritized').simulate('change');
    expect(spy.calledOnce).toBe(true);
  });
});
