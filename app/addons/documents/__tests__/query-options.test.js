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
import QueryOptions from '../index-results/components/queryoptions/QueryOptions';
import sinon from 'sinon';
import Constants from '../constants';

describe('QueryOptions', () => {
  const props = {
    includeDocs: false,
    queryOptionsToggleIncludeDocs: () => {},
    reduce: false,
    contentVisible: true,
    perPage: 10
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

    wrapper.instance().componentWillReceiveProps({
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

    wrapper.instance().componentWillReceiveProps({
      ddocsOnly: false
    });
    expect(spy.calledOnce).toBe(true);
  });
});
