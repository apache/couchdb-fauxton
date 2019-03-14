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
import MainFieldsView from '../index-results/components/queryoptions/MainFieldsView';
import sinon from 'sinon';

describe('MainFieldsView', () => {
  const defaultProps = {
    stable: false,
    toggleStable: () => {},
    update: 'true',
    changeUpdateField: () => {},
    enableStable: false
  };
  const docURL = 'http://foo.com';
  it('does not render reduce when showReduce is false', () => {
    const wrapper = mount(<MainFieldsView
      {...defaultProps}
      includeDocs={false}
      showReduce={false}
      reduce={false}
      toggleIncludeDocs={() => {}}
      docURL={docURL}
    />);

    expect(wrapper.find('#qoReduce').length).toBe(0);
  });

  it('render reduce when showReduce is true but does not render grouplevel when reduce is false', () => {
    const wrapper = mount(<MainFieldsView
      {...defaultProps}
      includeDocs={false}
      showReduce={true}
      reduce={false}
      toggleIncludeDocs={() => {}}
      docURL={docURL}
    />);

    expect(wrapper.find('#qoReduce').length).toBe(1);
    expect(wrapper.find('#qoGroupLevelGroup').length).toBe(0);
  });

  it('calls toggleIncludeDocs onChange', () => {
    const spy = sinon.spy();
    const wrapper = mount(<MainFieldsView
      {...defaultProps}
      includeDocs={false}
      showReduce={true}
      reduce={false}
      toggleIncludeDocs={spy}
      docURL={docURL}
    />);

    wrapper.find('#qoIncludeDocs').simulate('change');
    expect(spy.calledOnce).toBe(true);
  });

  it('calls groupLevelChange onChange', () => {
    const spy = sinon.spy();
    const wrapper = mount(<MainFieldsView
      {...defaultProps}
      includeDocs={false}
      showReduce={true}
      reduce={true}
      toggleIncludeDocs={() => {}}
      updateGroupLevel={spy}
      toggleReduce={() => {}}
      docURL={docURL}
    />);

    wrapper.find('#qoGroupLevel').simulate('change');
    expect(spy.calledOnce).toBe(true);
  });

  it('calls toggleReduce onChange', () => {
    const spy = sinon.spy();
    const wrapper = mount(<MainFieldsView
      {...defaultProps}
      includeDocs={false}
      showReduce={true}
      reduce={true}
      toggleIncludeDocs={() => {}}
      updateGroupLevel={() => {}}
      toggleReduce={spy}
      docURL={docURL}
    />);

    wrapper.find('#qoReduce').simulate('change');
    expect(spy.calledOnce).toBe(true);
  });

  it('calls toggleStable', () => {
    const spy = sinon.spy();
    const wrapper = mount(<MainFieldsView
      {...defaultProps}
      includeDocs={false}
      showReduce={false}
      reduce={false}
      toggleIncludeDocs={() => {}}
      toggleStable={spy}
      docURL={docURL}
      enableStable={true}
    />);

    wrapper.find('#qoStable').simulate('change');
    expect(spy.calledOnce).toBe(true);
  });

  it('calls changeUpdateField', () => {
    const spy = sinon.spy();
    const wrapper = mount(<MainFieldsView
      {...defaultProps}
      includeDocs={false}
      showReduce={false}
      reduce={false}
      toggleIncludeDocs={() => {}}
      changeUpdateField={spy}
      docURL={docURL}
    />);

    wrapper.find('#qoUpdate').simulate('change');
    expect(spy.calledOnce).toBe(true);
  });
});
