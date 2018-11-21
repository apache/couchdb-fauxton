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

import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import utils from '../../../../../test/mocha/testUtils';
import FauxtonAPI from '../../../../core/api';
import '../../base';
import DesignDoc from '../components/DesignDoc';
import IndexSection from '../components/IndexSection';
import MainSidebar from '../components/MainSidebar';

const { restore} = utils;

describe('DesignDoc', () => {
  const database = { id: 'test-db' };
  const selectedNavInfo = {
    navItem: 'all-docs',
    designDocName: '',
    designDocSection: '',
    indexName: ''
  };
  const defaultProps = {
    database,
    toggle: () => {},
    sidebarListTypes: [],
    isExpanded: true,
    isPartitioned: false,
    designDocName: 'doc-$-#-.1',
    selectedNavInfo,
    toggledSections: {},
    designDoc: {},
    showDeleteIndexModal: () => {},
    showCloneIndexModal: () => {}
  };

  afterEach(() => {
    restore(FauxtonAPI.urls);
  });

  it('confirm URLs are properly encoded when design doc name has special chars', () => {
    const wrapper = mount(<DesignDoc
      {...defaultProps}
      designDocName={'doc-$-#-.1'}
    />);

    expect(wrapper.find('a.icon.fonticon-plus-circled').at(1).props()['href']).toContain('/doc-%24-%23-.1');
    expect(wrapper.find('a.toggle-view.accordion-header').props()['href']).toContain('/doc-%24-%23-.1');
  });

  it('check toggle() works when design doc name has special characters', () => {
    sinon.stub(FauxtonAPI, 'urls');

    const toggleStub = sinon.stub();
    const wrapper = mount(<DesignDoc
      {...defaultProps}
      toggle={toggleStub}
      designDocName={'id#1'}
      selectedNavInfo={{}}
    />);

    // NOTE: wrapper.find doesn't work special chars so we use class name instead
    wrapper.find('div.accordion-list-item').simulate('click', {preventDefault: sinon.stub()});
    expect(toggleStub.calledOnce).toBeTruthy();
  });

  //here

  it('confirm only single sub-option is shown by default (metadata link)', function () {
    const el = mount(<DesignDoc
      {...defaultProps}
      designDoc={{ customProp: { one: 'something' } }}
      designDocName={'doc-$-#-.1'}
    />);

    const subOptions = el.find('.accordion-body li');
    expect(subOptions.length).toBe(1);
  });

  it('confirm design doc sidebar extensions appear', function () {
    sinon.stub(FauxtonAPI, 'urls');
    const el = mount(<DesignDoc
      {...defaultProps}
      sidebarListTypes={[{
        selector: 'customProp',
        name: 'Search Indexes',
        icon: 'icon-here',
        urlNamespace: 'whatever',
        indexLabel: 'the label',
        onDelete: () => {},
        onClone: () => {}
      }]}
      designDoc={{ customProp: { one: 'something' } }}
      designDocName={'doc-$-#-.1'}
    />);

    const subOptions = el.find('.accordion-body li');
    expect(subOptions.length).toBe(3); // 1 for "Metadata" row, 1 for Type List row ("search indexes") and one for the index itself
  });

  it('confirm design doc sidebar extensions do not appear when they have no content', function () {
    sinon.stub(FauxtonAPI, 'urls');
    const el = mount(<DesignDoc
      {...defaultProps}
      sidebarListTypes={[{
        selector: 'customProp',
        name: 'Search Indexes',
        icon: 'icon-here',
        urlNamespace: 'whatever',
        indexLabel: 'the label',
        onDelete: () => {},
        onClone: () => {}
      }]}
      designDocName={'doc-$-#-.1'}
    />);

    const subOptions = el.find('.accordion-body li');
    expect(subOptions.length).toBe(1);
  });

  it('confirm doc metadata page is highlighted if selected', function () {
    const el = mount(<DesignDoc
      {...defaultProps}
      selectedNavInfo={{
        navItem: 'designDoc',
        designDocName: 'id',
        designDocSection: 'metadata',
        indexName: ''
      }}
      designDocName={'doc-$-#-.1'}
    />);

    expect(el.find('.accordion-body li.active a').text()).toBe('Metadata');
  });

  it('shows different icons for global and partitioned ddocs', () => {
    const wrapper = mount(<DesignDoc
      {...defaultProps}
      designDocName={'doc-$-#-.1'}
      isPartitioned={false}
    />);
    expect(wrapper.find('i.fonticon-document').exists()).toBeTruthy();

    const wrapper2 = mount(<DesignDoc
      {...defaultProps}
      designDocName={'doc-$-#-.1'}
      isPartitioned={true}
    />);
    expect(wrapper2.find('i.fonticon-documents').exists()).toBeTruthy();
  });

  it('confirms links only include the partition key when one is selected', () => {
    const wrapper = mount(<DesignDoc
      {...defaultProps}
      selectedPartitionKey={'part-key-$-%1'}
    />);
    // Metadata link
    expect(wrapper.find('a.toggle-view.accordion-header').props()['href']).toContain('/_partition/part-key-%24-%251/');
    // New View link
    expect(wrapper.find('li > a.icon.fonticon-plus-circled').props()['href']).toContain('/_partition/part-key-%24-%251/');

    const wrapper2 = mount(<DesignDoc
      {...defaultProps}
    />);

    expect(wrapper2.find('a.toggle-view.accordion-header').props()['href']).not.toContain('/_partition/');
    expect(wrapper2.find('li > a.icon.fonticon-plus-circled').props()['href']).not.toContain('/_partition/');
  });
});

describe('MainSidebar', () => {
  const defaultProps = {
    databaseName: 'test-db',
    selectedNavItem: 'Metadata'
  };

  it('confirm links are properly encoded and include the partition key when provided', () => {
    const wrapper = mount(<MainSidebar
      {...defaultProps}
      selectedPartitionKey={'part-key-$-%1'}
    />);

    expect(wrapper.find('a#all-docs').props()['href']).toContain('/_partition/part-key-%24-%251/');
    expect(wrapper.find('a#design-docs').props()['href']).toContain('/_partition/part-key-%24-%251/');
    expect(wrapper.find('a#mango-query').props()['href']).toContain('/_partition/part-key-%24-%251/');
  });

  it('confirm New links are properly encoded and include the partition key when provided', () => {
    const wrapper = mount(<MainSidebar
      {...defaultProps}
      selectedPartitionKey={'part-key-$-%1'}
    />);

    const newLinks = wrapper.instance().getNewButtonLinks()[0].links;
    newLinks.forEach(link => {
      if (link.title === 'New Doc') {
        expect(link.url).toContain('?partitionKey=part-key-%24-%251');
      } else {
        expect(link.url).toContain('/_partition/part-key-%24-%251/');
      }
    });
  });
});

describe('IndexSection', () => {
  const defaultProps = {
    urlNamespace: 'view',
    indexLabel: 'Views',
    database: { id: 'test-db' },
    designDocName: 'ddoc-%-1',
    items: ['viewA-$', 'viewB/#'],
    isExpanded: true,
    isPartitioned: false,
    selectedPartitionKey: undefined,
    selectedIndex: 'bla',
    onDelete: () => {},
    onClone: () => {},
    showDeleteIndexModal: () => {},
    showCloneIndexModal: () => {}
  };

  it('encodes the links for each item', () => {
    const wrapper = mount(<IndexSection
      {...defaultProps}
    />);

    defaultProps.items.forEach((view, idx) => {
      expect(wrapper.find('a.toggle-view').at(idx).prop('href')).toContain(
        '/_design/' + encodeURIComponent('ddoc-%-1') + '/_view/' + encodeURIComponent(view)
      );
    });
  });

  it('links include partition key when one is selected', () => {
    const wrapper = mount(<IndexSection
      {...defaultProps}
      selectedPartitionKey={'part%1'}
    />);

    defaultProps.items.forEach((view, idx) => {
      expect(wrapper.find('a.toggle-view').at(idx).prop('href')).toContain('/_partition/' + encodeURIComponent('part%1') + '/');
    });
  });
});
