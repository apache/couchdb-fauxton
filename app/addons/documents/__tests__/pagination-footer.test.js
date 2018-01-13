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
import PaginationFooter from '../index-results/components/pagination/PaginationFooter';
import sinon from 'sinon';

describe('PaginationFooter', () => {
  const displayedFields = {};
  beforeEach(() => {
    displayedFields.shown = 5;
    displayedFields.allFieldCount = 10;
  });

  it('does not show table controls if showPrioritizedEnabled is false', () => {
    const wrapper = mount(<PaginationFooter
      showPrioritizedEnabled={false}
      hasResults={true}
      prioritizedEnabled={false}
      displayedFields={displayedFields}
      perPage={20}
      canShowNext={false}
      canShowPrevious={false}
      toggleShowAllColumns={() => {}}
      docs={[]}
      pageStart={1}
      pageEnd={20}
    />);

    expect(wrapper.find('#footer-doc-control-prioritized').length).toBe(0);
  });

  it('does not show table controls if hasResults is false', () => {
    const wrapper = mount(<PaginationFooter
      showPrioritizedEnabled={true}
      hasResults={false}
      prioritizedEnabled={false}
      displayedFields={displayedFields}
      perPage={20}
      canShowNext={false}
      canShowPrevious={false}
      toggleShowAllColumns={() => {}}
      docs={[]}
      pageStart={1}
      pageEnd={20}
    />);

    expect(wrapper.find('#footer-doc-control-prioritized').length).toBe(0);
  });

  it('does show table controls if showPrioritizedEnabled and hasResults are true', () => {
    const wrapper = mount(<PaginationFooter
      showPrioritizedEnabled={true}
      hasResults={true}
      prioritizedEnabled={false}
      displayedFields={displayedFields}
      perPage={20}
      canShowNext={false}
      canShowPrevious={false}
      toggleShowAllColumns={() => {}}
      docs={[]}
      pageStart={1}
      pageEnd={20}
    />);

    expect(wrapper.find('#footer-doc-control-prioritized').length).toBe(1);
  });

  it('calls paginateNext when clicked and available', () => {
    const spy = sinon.spy();
    const wrapper = mount(<PaginationFooter
      showPrioritizedEnabled={true}
      hasResults={true}
      prioritizedEnabled={false}
      displayedFields={displayedFields}
      perPage={20}
      canShowNext={true}
      canShowPrevious={false}
      toggleShowAllColumns={() => {}}
      docs={[]}
      pageStart={1}
      pageEnd={20}
      paginateNext={spy}
    />);

    wrapper.instance().nextClicked({ preventDefault: () => {} });
    expect(spy.calledOnce).toBe(true);
  });

  it('does not call paginateNext when clicked and not available', () => {
    const spy = sinon.spy();
    const wrapper = mount(<PaginationFooter
      showPrioritizedEnabled={true}
      hasResults={true}
      prioritizedEnabled={false}
      displayedFields={displayedFields}
      perPage={20}
      canShowNext={false}
      canShowPrevious={false}
      toggleShowAllColumns={() => {}}
      docs={[]}
      pageStart={1}
      pageEnd={20}
      paginateNext={spy}
    />);

    wrapper.instance().nextClicked({ preventDefault: () => {} });
    expect(spy.calledOnce).toBe(false);
  });

  it('calls paginatePrevious when clicked and available', () => {
    const spy = sinon.spy();
    const wrapper = mount(<PaginationFooter
      showPrioritizedEnabled={true}
      hasResults={true}
      prioritizedEnabled={false}
      displayedFields={displayedFields}
      perPage={20}
      canShowNext={false}
      canShowPrevious={true}
      toggleShowAllColumns={() => {}}
      docs={[]}
      pageStart={1}
      pageEnd={20}
      paginatePrevious={spy}
    />);

    wrapper.instance().previousClicked({ preventDefault: () => {} });
    expect(spy.calledOnce).toBe(true);
  });

  it('does not call paginatePrevious when clicked and not available', () => {
    const spy = sinon.spy();
    const wrapper = mount(<PaginationFooter
      showPrioritizedEnabled={true}
      hasResults={true}
      prioritizedEnabled={false}
      displayedFields={displayedFields}
      perPage={20}
      canShowNext={false}
      canShowPrevious={false}
      toggleShowAllColumns={() => {}}
      docs={[]}
      pageStart={1}
      pageEnd={20}
      paginatePrevious={spy}
    />);

    wrapper.instance().previousClicked({ preventDefault: () => {} });
    expect(spy.calledOnce).toBe(false);
  });

  it('renders custom text when no docs', () => {
    const wrapper = mount(<PaginationFooter
      showPrioritizedEnabled={true}
      hasResults={true}
      prioritizedEnabled={false}
      displayedFields={displayedFields}
      perPage={20}
      canShowNext={false}
      canShowPrevious={false}
      toggleShowAllColumns={() => {}}
      docs={[]}
      pageStart={1}
      pageEnd={20}
    />);

    expect(wrapper.find('.current-docs span').text()).toMatch('Showing 0 documents.');
  });

  it('renders text indicating range when docs', () => {
    const wrapper = mount(<PaginationFooter
      showPrioritizedEnabled={true}
      hasResults={true}
      prioritizedEnabled={false}
      displayedFields={displayedFields}
      perPage={20}
      canShowNext={false}
      canShowPrevious={false}
      toggleShowAllColumns={() => {}}
      docs={[{_id: 'foo'}]}
      pageStart={1}
      pageEnd={20}
    />);

    expect(wrapper.find('.current-docs span').text()).toMatch('Showing document 1 - 20.');
  });
});
