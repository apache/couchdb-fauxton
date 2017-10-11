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

import utils from '../../../../../test/mocha/testUtils';
import FauxtonAPI from "../../../../core/api";
import React from "react";
import ReactDOM from "react-dom";
import sinon from "sinon";
import { mount } from 'enzyme';
import Components from "../sidebar";
import '../../base';

const {DesignDoc} = Components;

const { assert, restore} = utils;


describe('DesignDoc', () => {
  const database = { id: 'test-db' };
  const selectedNavInfo = {
    navItem: 'all-docs',
    designDocName: '',
    designDocSection: '',
    indexName: ''
  };

  afterEach(() => {
    restore(FauxtonAPI.urls);
  });

  it('confirm URLs are properly encoded when design doc name has special chars', () => {
    sinon.stub(FauxtonAPI, 'urls').callsFake((a, b, c, d) => {
      if (a === 'designDocs') {
        return '#/database/MOCK/_design/' + encodeURIComponent(c) + '/' + encodeURIComponent(d);
      }
      return '' + (a || '') + '/' + (b || '') + '/' + (c || '') + '/' + (d || '');
    });
    const wrapper = mount(<DesignDoc
      database={database}
      toggle={sinon.stub()}
      sidebarListTypes={[]}
      isExpanded={true}
      designDocName={'doc-$-#-.1'}
      selectedNavInfo={selectedNavInfo}
      toggledSections={{}}
      designDoc={{}} />);

    assert.include(wrapper.find('a.icon .fonticon-plus-circled').at(1).props()['href'], '/doc-%24-%23-.1');
    assert.include(wrapper.find('a.toggle-view .accordion-header').props()['href'], '/doc-%24-%23-.1');
  });

  it('check toggle() works when design doc name has special characters', () => {
    sinon.stub(FauxtonAPI, 'urls');

    const toggleStub = sinon.stub();
    const wrapper = mount(<DesignDoc
      database={database}
      toggle={toggleStub}
      sidebarListTypes={[]}
      isExpanded={true}
      designDocName={'id#1'}
      selectedNavInfo={{}}
      toggledSections={{}}
      designDoc={{}} />);

    // NOTE: wrapper.find doesn't work special chars so we use class name instead
    wrapper.find('div.accordion-list-item').simulate('click', {preventDefault: sinon.stub()});
    assert.ok(toggleStub.calledOnce);
  });

  //here

  it('confirm only single sub-option is shown by default (metadata link)', function () {
    const el = mount(<DesignDoc
      database={database}
      toggle={function () {}}
      sidebarListTypes={[]}
      isExpanded={true}
      selectedNavInfo={selectedNavInfo}
      toggledSections={{}}
      designDoc={{ customProp: { one: 'something' } }}
      designDocName={'doc-$-#-.1'}
    />);

    const subOptions = el.find('.accordion-body li');
    assert.equal(subOptions.length, 1);
 });

  it('confirm design doc sidebar extensions appear', function () {
    const el = mount(<DesignDoc
      database={database}
      toggle={function () {}}
      sidebarListTypes={[{
        selector: 'customProp',
        name: 'Search Indexes',
        icon: 'icon-here',
        urlNamespace: 'whatever',
        indexLabel: 'the label',
        onDelete: () => {},
        onClone: () => {}
      }]}
      isExpanded={true}
      selectedNavInfo={selectedNavInfo}
      toggledSections={{}}
      designDoc={{ customProp: { one: 'something' } }}
      designDocName={'doc-$-#-.1'}
    />);

    const subOptions = el.find('.accordion-body li');
    assert.equal(subOptions.length, 3); // 1 for "Metadata" row, 1 for Type List row ("search indexes") and one for the index itself
  });

  it('confirm design doc sidebar extensions do not appear when they have no content', function () {
    const el = mount(<DesignDoc
      database={database}
      toggle={function () {}}
      sidebarListTypes={[{
        selector: 'customProp',
        name: 'Search Indexes',
        icon: 'icon-here',
        urlNamespace: 'whatever',
        indexLabel: 'the label',
        onDelete: () => {},
        onClone: () => {}
      }]}
      isExpanded={true}
      selectedNavInfo={selectedNavInfo}
      designDoc={{}} // note that this is empty
      designDocName={'doc-$-#-.1'}
      toggledSections={{}}
    />);

    const subOptions = el.find('.accordion-body li');
    assert.equal(subOptions.length, 1);
  });

  it('confirm doc metadata page is highlighted if selected', function () {
    const el = mount(<DesignDoc
      database={database}
      toggle={function () {}}
      sidebarListTypes={[]}
      isExpanded={true}
      selectedNavInfo={{
        navItem: 'designDoc',
        designDocName: 'id',
        designDocSection: 'metadata',
        indexName: ''
      }}
      designDocName={'doc-$-#-.1'}
      toggledSections={{}}
      designDoc={{}} />);

    assert.equal(el.find('.accordion-body li.active a').text(), 'Metadata');
  });
});
