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

import { shallow, mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import QueryOptions from '../index-results/components/queryoptions/QueryOptions';
import Constants from '../constants';

describe('QueryOptions', () => {
  const props = {
    includeDocs: false,
    queryOptionsToggleIncludeDocs: () => {},
    reduce: false,
    contentVisible: true,
    perPage: 10,
    queryOptionsToggleStable: () => {},
    queryOptionsChangeUpdate: () => {},
    stable: false,
    update: 'true',
    betweenKeys: {},
    showReduce: true,
    enableStable: true
  };

  it('calls resetPagination and queryOptionsExecute on submit', () => {
    const spy1 = sinon.spy();
    const spy2 = sinon.spy();
    const queryOptionsParams = {
      include_docs: false
    };

    const wrapper = shallow(<QueryOptions
      queryOptionsExecute={spy1}
      resetPagination={spy2}
      queryOptionsToggleVisibility={() => {}}
      queryOptionsParams={queryOptionsParams}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}
      changeLayout={() => {}}
      queryOptionsApplyFilterOnlyDdocs={() => {}}
      queryOptionsRemoveFilterOnlyDdocs={() => {}}
      {...props}
    />);

    wrapper.instance().executeQuery();
    expect(spy1.calledOnce).toBe(true);
    expect(spy2.calledOnce).toBe(true);
  });

  it('calls queryOptionsApplyFilterOnlyDdocs if ddocsOnly is true', () => {
    const spy = sinon.spy();
    const queryOptionsParams = {
      include_docs: false
    };

    shallow(<QueryOptions
      ddocsOnly={true}
      queryOptionsApplyFilterOnlyDdocs={spy}
      queryOptionsRemoveFilterOnlyDdocs={() => {}}
      queryOptionsExecute={() => {}}
      resetPagination={() => {}}
      queryOptionsToggleVisibility={() => {}}
      queryOptionsParams={queryOptionsParams}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}
      changeLayout={() => {}}
      {...props}
    />);

    expect(spy.calledOnce).toBe(true);
  });

  it('calls queryOptionsApplyFilterOnlyDdocs if ddocsOnly switches to true on new props', () => {
    const spy = sinon.spy();
    const queryOptionsParams = {
      include_docs: false
    };

    const wrapper = shallow(<QueryOptions
      ddocsOnly={false}
      queryOptionsRemoveFilterOnlyDdocs={() => {}}
      queryOptionsApplyFilterOnlyDdocs={spy}
      queryOptionsExecute={() => {}}
      resetPagination={() => {}}
      queryOptionsToggleVisibility={() => {}}
      queryOptionsParams={queryOptionsParams}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}
      changeLayout={() => {}}
      {...props}
    />);

    wrapper.instance().UNSAFE_componentWillReceiveProps({
      ddocsOnly: true
    });
    expect(spy.calledOnce).toBe(true);
  });

  it('calls queryOptionsRemoveFilterOnlyDdocs if ddocsOnly switches to false on new props', () => {
    const spy = sinon.spy();
    const queryOptionsParams = {
      include_docs: false
    };

    const wrapper = shallow(<QueryOptions
      ddocsOnly={true}
      queryOptionsRemoveFilterOnlyDdocs={spy}
      queryOptionsApplyFilterOnlyDdocs={() => {}}
      queryOptionsExecute={() => {}}
      resetPagination={() => {}}
      queryOptionsToggleVisibility={() => {}}
      queryOptionsParams={queryOptionsParams}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}
      changeLayout={() => {}}
      {...props}
    />);

    wrapper.instance().UNSAFE_componentWillReceiveProps({
      ddocsOnly: false
    });
    expect(spy.calledOnce).toBe(true);
  });

  it('button is not highlighted when query options are not set', () => {

    const wrapper = shallow(<QueryOptions
      ddocsOnly={true}
      update='true'
      queryOptionsRemoveFilterOnlyDdocs={() => {}}
      queryOptionsApplyFilterOnlyDdocs={() => {}}
      queryOptionsExecute={() => {}}
      resetPagination={() => {}}
      queryOptionsToggleVisibility={() => {}}
      queryOptionsParams={{}}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}
      changeLayout={() => {}}
      {...props}
    />);

    const isHighlighted = wrapper.find('ToggleHeaderButton').prop('active');
    expect(isHighlighted).toBe(false);
  });

  it('button is highlighted when reduce option is enabled', () => {
    const newProps = {
      ...props,
      reduce: true
    };
    const wrapper = shallow(<QueryOptions
      ddocsOnly={true}
      queryOptionsRemoveFilterOnlyDdocs={() => {}}
      queryOptionsApplyFilterOnlyDdocs={() => {}}
      queryOptionsExecute={() => {}}
      resetPagination={() => {}}
      queryOptionsToggleVisibility={() => {}}
      queryOptionsParams={{}}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}
      changeLayout={() => {}}
      {...newProps}
    />);

    const isHighlighted = wrapper.find('ToggleHeaderButton').prop('active');
    expect(isHighlighted).toBe(true);
  });

  it('button is highlighted when limit option is set', () => {
    const newProps = {
      ...props,
      limit: 3
    };
    const wrapper = shallow(<QueryOptions
      ddocsOnly={true}
      queryOptionsRemoveFilterOnlyDdocs={() => {}}
      queryOptionsApplyFilterOnlyDdocs={() => {}}
      queryOptionsExecute={() => {}}
      resetPagination={() => {}}
      queryOptionsToggleVisibility={() => {}}
      queryOptionsParams={{}}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}
      changeLayout={() => {}}
      {...newProps}
    />);

    const isHighlighted = wrapper.find('ToggleHeaderButton').prop('active');
    expect(isHighlighted).toBe(true);
  });

  it('button is highlighted when skip option is set', () => {
    const newProps = {
      ...props,
      skip: 3
    };
    const wrapper = shallow(<QueryOptions
      ddocsOnly={true}
      queryOptionsRemoveFilterOnlyDdocs={() => {}}
      queryOptionsApplyFilterOnlyDdocs={() => {}}
      queryOptionsExecute={() => {}}
      resetPagination={() => {}}
      queryOptionsToggleVisibility={() => {}}
      queryOptionsParams={{}}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}
      changeLayout={() => {}}
      {...newProps}
    />);

    const isHighlighted = wrapper.find('ToggleHeaderButton').prop('active');
    expect(isHighlighted).toBe(true);
  });

  it('button is highlighted when betweenKeys option is set', () => {
    const newProps = {
      ...props,
      betweenKeys: {startkey:"a"}
    };
    const wrapper = shallow(<QueryOptions
      ddocsOnly={true}
      queryOptionsRemoveFilterOnlyDdocs={() => {}}
      queryOptionsApplyFilterOnlyDdocs={() => {}}
      queryOptionsExecute={() => {}}
      resetPagination={() => {}}
      queryOptionsToggleVisibility={() => {}}
      queryOptionsParams={{}}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}
      changeLayout={() => {}}
      {...newProps}
    />);

    const isHighlighted = wrapper.find('ToggleHeaderButton').prop('active');
    expect(isHighlighted).toBe(true);
  });

  it('button is highlighted when byKeys option is set', () => {
    const newProps = {
      ...props,
      byKeys: {}
    };
    const wrapper = shallow(<QueryOptions
      ddocsOnly={true}
      queryOptionsRemoveFilterOnlyDdocs={() => {}}
      queryOptionsApplyFilterOnlyDdocs={() => {}}
      queryOptionsExecute={() => {}}
      resetPagination={() => {}}
      queryOptionsToggleVisibility={() => {}}
      queryOptionsParams={{}}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}
      changeLayout={() => {}}
      {...newProps}
    />);

    const isHighlighted = wrapper.find('ToggleHeaderButton').prop('active');
    expect(isHighlighted).toBe(true);
  });

  it('button is highlighted when descending option is enabled', () => {
    const newProps = {
      ...props,
      descending: true
    };
    const wrapper = shallow(<QueryOptions
      ddocsOnly={true}
      queryOptionsRemoveFilterOnlyDdocs={() => {}}
      queryOptionsApplyFilterOnlyDdocs={() => {}}
      queryOptionsExecute={() => {}}
      resetPagination={() => {}}
      queryOptionsToggleVisibility={() => {}}
      queryOptionsParams={{}}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}
      changeLayout={() => {}}
      {...newProps}
    />);

    const isHighlighted = wrapper.find('ToggleHeaderButton').prop('active');
    expect(isHighlighted).toBe(true);
  });

  it('button is not highlighted when includeDocs option is enabled', () => {
    const newProps = {
      ...props,
      includeDocs: true
    };
    const wrapper = shallow(<QueryOptions
      ddocsOnly={true}
      update='true'
      queryOptionsRemoveFilterOnlyDdocs={() => {}}
      queryOptionsApplyFilterOnlyDdocs={() => {}}
      queryOptionsExecute={() => {}}
      resetPagination={() => {}}
      queryOptionsToggleVisibility={() => {}}
      queryOptionsParams={{}}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}
      changeLayout={() => {}}
      {...newProps}
    />);

    const isHighlighted = wrapper.find('ToggleHeaderButton').prop('active');
    expect(isHighlighted).toBe(false);
  });

  it('stable option is only enabled when enableStable is true', () => {
    const wrapper = mount(<QueryOptions
      {...props}
      ddocsOnly={true}
      update='true'
      queryOptionsRemoveFilterOnlyDdocs={() => {}}
      queryOptionsApplyFilterOnlyDdocs={() => {}}
      queryOptionsExecute={() => {}}
      resetPagination={() => {}}
      queryOptionsToggleVisibility={() => {}}
      queryOptionsParams={{}}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}
      changeLayout={() => {}}
      showReduce={true}
      enableStable={true}
    />);

    expect(wrapper.find('input#qoStable').prop("disabled")).toBe(false);
    wrapper.setProps({enableStable: false});
    expect(wrapper.find('input#qoStable').prop("disabled")).toBe(true);
  });

  it('reduce option is only displayed when showReduce is true', () => {
    const wrapper = mount(<QueryOptions
      {...props}
      ddocsOnly={true}
      update='true'
      queryOptionsRemoveFilterOnlyDdocs={() => {}}
      queryOptionsApplyFilterOnlyDdocs={() => {}}
      queryOptionsExecute={() => {}}
      resetPagination={() => {}}
      queryOptionsToggleVisibility={() => {}}
      queryOptionsParams={{}}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}
      changeLayout={() => {}}
      showReduce={true}
      enableStable={true}
    />);

    expect(wrapper.find('input#qoReduce').exists()).toBe(true);

    wrapper.setProps({showReduce: false});
    expect(wrapper.find('input#qoReduce').exists()).toBe(false);
  });

});
