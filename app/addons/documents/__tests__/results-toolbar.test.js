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
import utils from '../../../../test/mocha/testUtils';
import FauxtonAPI from '../../../core/api';
import {ResultsToolBar} from '../components/results-toolbar';
import Constants from '../constants';

describe('Results Toolbar', () => {
  const restProps = {
    removeItem: () => {},
    allDocumentsSelected: false,
    hasSelectedItem: false,
    toggleSelectAll: () => {},
    isLoading: false,
    queryOptionsParams: {},
    databaseName: 'mydb',
    fetchUrl: '/db1/_all_docs',
    docType: Constants.INDEX_RESULTS_DOC_TYPE.VIEW,
    hasResults: true
  };

  beforeEach(() => {
    sinon.stub(FauxtonAPI, 'urls').withArgs('new').returns('mock-url');
  });

  afterEach(() => {
    utils.restore(FauxtonAPI.urls);
  });

  it('renders all content when there are results and they are deletable', () => {
    const wrapper = mount(<ResultsToolBar hasResults={true} isListDeletable={true} {...restProps}/>);
    expect(wrapper.find('.bulk-action-component').length).toBe(1);
    expect(wrapper.find('div.two-sides-toggle-button').length).toBe(1);
    expect(wrapper.find('.document-result-screen__toolbar-create-btn').length).toBe(1);
  });

  it('does not render bulk action component when list is not deletable', () => {
    const wrapper = mount(<ResultsToolBar hasResults={true} isListDeletable={false} {...restProps}/>);
    expect(wrapper.find('.bulk-action-component').length).toBe(0);
    expect(wrapper.find('div.two-sides-toggle-button').length).toBe(1);
    expect(wrapper.find('.document-result-screen__toolbar-create-btn').length).toBe(1);
  });

  it('includes default partition key when one is selected', () => {
    const wrapper = mount(<ResultsToolBar hasResults={true} isListDeletable={false} {...restProps} partitionKey={'partKey1'}/>);
    expect(wrapper.find('a').prop('href')).toMatch(/\?partitionKey=partKey1$/);
  });

  it('shows Table, Metadata and JSON modes when querying a global view', () => {
    const wrapper = mount(<ResultsToolBar hasResults={true} isListDeletable={false} {...restProps}
      partitionKey={''} fetchUrl='/my_db/_design/ddoc1/_view/view1'/>);
    expect(wrapper.find('button')).toHaveLength(3);
  });

  it('hides Table and JSON modes when querying a partitioned view', () => {
    const wrapper = mount(<ResultsToolBar hasResults={true} isListDeletable={false} {...restProps}
      partitionKey={'partKey1'} fetchUrl='/my_db/_partition/my_partition/_design/ddoc1/_view/view1'/>);
    expect(wrapper.find('button')).toHaveLength(1);
  });

  it('shows Table, Metadata and JSON modes when showing All Documents filtered by partition', () => {
    const wrapper = mount(<ResultsToolBar hasResults={true} isListDeletable={false} {...restProps}
      partitionKey={'partKey1'} fetchUrl='/my_db/_all_docs'/>);
    expect(wrapper.find('button')).toHaveLength(3);
  });
});
