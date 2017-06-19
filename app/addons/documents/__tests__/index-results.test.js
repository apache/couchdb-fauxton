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
  it('calls fetchAllDocs on mount', () => {
    const spy = sinon.spy();
    const wrapper = shallow(<IndexResults
      fetchParams={{}}
      selectedDocs={[]}
      queryOptionsParams={{}}
      fetchAllDocs={spy}
      results={[]}
    />);

    wrapper.instance().componentDidMount();
    expect(spy.calledOnce).toBe(true);
  });

  it('calls fetchAllDocs on update if ddocsOnly switches', () => {
    const spy = sinon.spy();
    const wrapper = shallow(<IndexResults
      fetchParams={{}}
      selectedDocs={[]}
      queryOptionsParams={{}}
      fetchAllDocs={() => {}}
      results={[]}
      ddocsOnly={false}
    />);

    wrapper.instance().componentWillUpdate({
      ddocsOnly: true,
      fetchParams: {},
      queryOptionsParams: {},
      fetchAllDocs: spy
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
      fetchAllDocs={() => {}}
      results={[]}
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
      fetchAllDocs={() => {}}
      results={[]}
    />);

    expect(wrapper.instance().isSelected('foo')).toBe(true);
  });

  it('isSelected returns false when id is not in selectedDocs', () => {
    const selectedDocs = [{
      _id: 'bar'
    }];
    const wrapper = shallow(<IndexResults
      selectedDocs={selectedDocs}
      fetchAllDocs={() => {}}
      results={[]}
    />);

    expect(wrapper.instance().isSelected('foo')).toBe(false);
  });

  it('docChecked calls selectDoc', () => {
    const spy = sinon.spy();
    const wrapper = shallow(<IndexResults
      selectedDocs={[]}
      fetchAllDocs={() => {}}
      results={[]}
      selectDoc={spy}
    />);

    wrapper.instance().docChecked('foo', '1-123324345');
    expect(spy.calledOnce).toBe(true);
  });

  it('toggleSelectAll calls bulkCheckOrUncheck', () => {
    const spy = sinon.spy();
    const wrapper = shallow(<IndexResults
      selectedDocs={[]}
      fetchAllDocs={() => {}}
      results={[]}
      docs={[]}
      allDocumentsSelected={false}
      bulkCheckOrUncheck={spy}
    />);

    wrapper.instance().toggleSelectAll();
    expect(spy.calledOnce).toBe(true);
  });
});
