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
import AdditionalParams from '../index-results/components/queryoptions/AdditionalParams';
import sinon from 'sinon';

describe('AdditionalParams', () => {
  it('updateSkip is called after change', () => {
    const spy = sinon.spy();
    const wrapper = mount(<AdditionalParams
      limit={10}
      descending={false}
      skip={0}
      updateSkip={spy}
    />);

    wrapper.find('#qoSkip').simulate('change');
    expect(spy.calledOnce).toBe(true);
  });

  it('updateLimit is called after change', () => {
    const spy = sinon.spy();
    const wrapper = mount(<AdditionalParams
      limit={10}
      descending={false}
      skip={0}
      updateLimit={spy}
    />);

    wrapper.find('#qoLimit').simulate('change');
    expect(spy.calledOnce).toBe(true);
  });

  it('toggleDescending is called after change', () => {
    const spy = sinon.spy();
    const wrapper = mount(<AdditionalParams
      limit={10}
      descending={false}
      skip={0}
      toggleDescending={spy}
    />);

    wrapper.find('#qoDescending').simulate('change');
    expect(spy.calledOnce).toBe(true);
  });
});
