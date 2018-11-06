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
import { shallow } from 'enzyme';
import PartitionKeySelector from '../partition-key/PartitionKeySelector';
import sinon from 'sinon';

describe('PartitionKeySelector', () => {
  const defaultProps = {
    selectorVisible: true,
    partitionKey: '',
    checkDbPartitioned: () => {},
    onPartitionKeySelected: () => {}
  };

  it('is only rendered when selectorVisible is set to true', () => {
    const wrapper = shallow(<PartitionKeySelector
      {...defaultProps}
      selectorVisible={false}
    />);
    expect(wrapper.find('div.partition-selector').exists()).toBe(false);

    const wrapper2 = shallow(<PartitionKeySelector
      {...defaultProps}
      selectorVisible={true}
    />);
    expect(wrapper2.find('div.partition-selector').exists()).toBe(true);
  });

  it('uses global mode by default', () => {
    const wrapper = shallow(<PartitionKeySelector
      {...defaultProps}
      partitionKey='part1'
    />);

    const btLabel = wrapper.find('div').text();
    expect(btLabel).toMatch('No partition selected');
  });

  it('switches from global mode to partition mode when a key is already set', () => {
    const spyOnKeySelected = sinon.spy();
    const wrapper = shallow(<PartitionKeySelector
      {...defaultProps}
      partitionKey='part1'
      globalMode={true}
      onPartitionKeySelected={spyOnKeySelected}
    />);

    wrapper.find('button').simulate('click');
    expect(spyOnKeySelected.calledOnce).toBe(true);
  });

  it('if a key is not set switching from global mode shows the text input', () => {
    const spyOnKeySelected = sinon.spy();
    const wrapper = shallow(<PartitionKeySelector
      {...defaultProps}
      partitionKey=''
      globalMode={true}
      onPartitionKeySelected={spyOnKeySelected}
    />);

    expect(wrapper.state().editMode).toBe(false);
    wrapper.find('button').simulate('click');
    expect(wrapper.state().editMode).toBe(true);
    expect(spyOnKeySelected.calledOnce).toBe(false);
  });

  it('switches from partition mode to global mode', () => {
    const spyOnGlobalSelected = sinon.spy();
    const wrapper = shallow(<PartitionKeySelector
      {...defaultProps}
      partitionKey='part1'
      globalMode={false}
      onGlobalModeSelected={spyOnGlobalSelected}
    />);

    wrapper.find('button').simulate('click');
    expect(spyOnGlobalSelected.calledOnce).toBe(true);
  });

  it('calls onPartitionKeySelected when a new value is set by pressing Enter', () => {
    const spyOnKeySelected = sinon.spy();
    const wrapper = shallow(<PartitionKeySelector
      {...defaultProps}
      partitionKey=''
      globalMode={true}
      onPartitionKeySelected={spyOnKeySelected}
    />);

    // Start edit mode
    wrapper.find('button').simulate('click');
    expect(wrapper.state().editMode).toBe(true);
    // Set new value
    wrapper.find('input').simulate('change', { target: { value: 'new_part_key' } });
    wrapper.find('input').simulate('keypress', {key: 'Enter'});
    expect(spyOnKeySelected.calledOnce).toBe(true);
  });

  it('calls onPartitionKeySelected when a new value is set and the component loses focus', () => {
    const spyOnKeySelected = sinon.spy();
    const wrapper = shallow(<PartitionKeySelector
      {...defaultProps}
      partitionKey=''
      globalMode={true}
      onPartitionKeySelected={spyOnKeySelected}
    />);

    // Start edit mode
    wrapper.find('button').simulate('click');
    expect(wrapper.state().editMode).toBe(true);
    // Set new value
    wrapper.find('input').simulate('change', { target: { value: 'new_part_key' } });
    wrapper.find('input').simulate('blur');
    expect(spyOnKeySelected.calledOnce).toBe(true);
  });

});
