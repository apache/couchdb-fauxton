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
import KeySearchFields from '../index-results/components/queryoptions/KeySearchFields';
import sinon from 'sinon';

describe('KeySearchFields', () => {
  const betweenKeys = {
    startkey: 'foo',
    endKey: 'bar',
    include: true
  };

  it('byKeysClass contains \'hide\' and byKeysButtonClass contains \'active\' when showByKeys is false', () => {
    const wrapper = mount(<KeySearchFields
      showByKeys={false}
      showBetweenKeys={true}
      betweenKeys={betweenKeys}
    />);

    expect(wrapper.find('#js-showKeys').hasClass('hide')).toBe(true);
    expect(wrapper.find('label[htmlFor="betweenKeys"]').hasClass('active')).toBe(true);
  });

  it('betweenKeysClass contains \'hide\' and betweenKeysButtonClass contains \'active\' when showBetweenKeys is false', () => {
    const wrapper = mount(<KeySearchFields
      showByKeys={true}
      showBetweenKeys={false}
      betweenKeys={betweenKeys}
    />);

    expect(wrapper.find('#js-showStartEnd').hasClass('hide')).toBe(true);
    expect(wrapper.find('label[htmlFor="byKeys"]').hasClass('active')).toBe(true);
  });

  it('calls toggleByKeys onClick', () => {
    const spy = sinon.spy();
    const wrapper = mount(<KeySearchFields
      showByKeys={true}
      showBetweenKeys={false}
      betweenKeys={betweenKeys}
      toggleByKeys={spy}
    />);

    wrapper.find('label[htmlFor="byKeys"]').simulate('click');
    expect(spy.calledOnce).toBe(true);
  });

  it('calls toggleBetweenKeys onClick', () => {
    const spy = sinon.spy();
    const wrapper = mount(<KeySearchFields
      showByKeys={false}
      showBetweenKeys={true}
      betweenKeys={betweenKeys}
      toggleBetweenKeys={spy}
    />);

    wrapper.find('label[htmlFor="betweenKeys"]').simulate('click');
    expect(spy.calledOnce).toBe(true);
  });

  it('calls updateBetweenKeys onChange', () => {
    const spy = sinon.spy();
    const wrapper = mount(<KeySearchFields
      showByKeys={false}
      showBetweenKeys={true}
      betweenKeys={betweenKeys}
      updateBetweenKeys={spy}
    />);

    wrapper.find('input#startkey').simulate('change');
    wrapper.find('input#endkey').simulate('change');
    expect(spy.calledTwice).toBe(true);
  });

  it('calls updateInclusiveEnd onChange', () => {
    const spy = sinon.spy();
    const wrapper = mount(<KeySearchFields
      showByKeys={false}
      showBetweenKeys={true}
      betweenKeys={betweenKeys}
      updateBetweenKeys={spy}
    />);

    wrapper.find('input#qoIncludeEndKeyInResults').simulate('change');
    expect(spy.calledOnce).toBe(true);
  });

  it('calls updateByKeys onChange', () => {
    const spy = sinon.spy();
    const wrapper = mount(<KeySearchFields
      showByKeys={false}
      showBetweenKeys={true}
      betweenKeys={betweenKeys}
      updateByKeys={spy}
    />);

    wrapper.find('textarea#keys-input').simulate('change');
    expect(spy.calledOnce).toBe(true);
  });
});
