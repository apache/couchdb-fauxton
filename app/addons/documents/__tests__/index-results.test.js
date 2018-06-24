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
import IndexResults from '../index-results/components/results/IndexResults';
import sinon from 'sinon';

describe('IndexResults', () => {
  it('calls fetchDocs on mount only when fetchAtStartup is set to true', () => {
    const spy = sinon.spy();
    shallow(<IndexResults
      fetchParams={{}}
      selectedDocs={[]}
      queryOptionsParams={{}}
      fetchDocs={spy}
      results={[]}
      fetchAtStartup={true}
    />);

    expect(spy.calledOnce).toBe(true);

    spy.resetHistory();
    const wrapperDontFetch = shallow(<IndexResults
      fetchParams={{}}
      selectedDocs={[]}
      queryOptionsParams={{}}
      fetchDocs={spy}
      results={[]}
      fetchAtStartup={false}
    />);

    wrapperDontFetch.instance().componentDidMount();
    expect(spy.notCalled).toBe(true);
  });

  it('calls fetchDocs on update if ddocsOnly switches', () => {
    const spy = sinon.spy();
    const wrapper = shallow(<IndexResults
      fetchParams={{}}
      selectedDocs={[]}
      queryOptionsParams={{}}
      fetchDocs={() => { }}
      resetState={() => { }}
      results={[]}
      ddocsOnly={false}
      fetchAtStartup={true}
      fetchUrl={''}
    />);

    wrapper.instance().UNSAFE_componentWillUpdate({
      ddocsOnly: true,
      fetchParams: {},
      queryOptionsParams: {},
      fetchDocs: spy,
      resetState: () => { },
    });

    expect(spy.calledOnce).toBe(true);
  });

  it('calls fetchDocs on update if fetchUrl switches', () => {
    const spy = sinon.spy();
    const wrapper = shallow(<IndexResults
      fetchParams={{}}
      selectedDocs={[]}
      queryOptionsParams={{}}
      fetchDocs={() => { }}
      resetState={() => { }}
      results={[]}
      ddocsOnly={false}
      fetchAtStartup={true}
      fetchUrl={'view1'}
    />);

    wrapper.instance().UNSAFE_componentWillUpdate({
      fetchParams: {},
      queryOptionsParams: {},
      fetchDocs: spy,
      resetState: () => { },
      fetchUrl: 'view2'
    });

    expect(spy.calledOnce).toBe(true);
  });

  it('deleteSelectedDocs calls bulkDeleteDocs', () => {
    const spy = sinon.spy();
    const wrapper = shallow(<IndexResults
      bulkDeleteDocs={spy}
      fetchParams={{}}
      selectedDocs={[]}
      queryOptionsParams={{}}
      fetchDocs={() => { }}
      results={[]}
      fetchAtStartup={true}
    />);

    wrapper.instance().deleteSelectedDocs();
    expect(spy.calledOnce).toBe(true);
  });

  it('isSelected returns true when id is in selectedDocs', () => {
    const selectedDocs = [{
      _id: 'foo'
    }];
    const wrapper = shallow(<IndexResults
      selectedDocs={selectedDocs}
      fetchDocs={() => { }}
      results={[]}
      fetchAtStartup={true}
    />);

    expect(wrapper.instance().isSelected('foo')).toBe(true);
  });

  it('isSelected returns false when id is not in selectedDocs', () => {
    const selectedDocs = [{
      _id: 'bar'
    }];
    const wrapper = shallow(<IndexResults
      selectedDocs={selectedDocs}
      fetchDocs={() => { }}
      results={[]}
      fetchAtStartup={true}
    />);

    expect(wrapper.instance().isSelected('foo')).toBe(false);
  });

  it('docChecked calls selectDoc', () => {
    const spy = sinon.spy();
    const wrapper = shallow(<IndexResults
      selectedDocs={[]}
      fetchDocs={() => { }}
      results={[]}
      selectDoc={spy}
      fetchAtStartup={true}
    />);

    wrapper.instance().docChecked('foo', '1-123324345');
    expect(spy.calledOnce).toBe(true);
  });

  it('toggleSelectAll calls bulkCheckOrUncheck', () => {
    const spy = sinon.spy();
    const wrapper = shallow(<IndexResults
      selectedDocs={[]}
      fetchDocs={() => { }}
      results={[]}
      docs={[]}
      allDocumentsSelected={false}
      bulkCheckOrUncheck={spy}
      fetchAtStartup={true}
    />);

    wrapper.instance().toggleSelectAll();
    expect(spy.calledOnce).toBe(true);
  });
});
