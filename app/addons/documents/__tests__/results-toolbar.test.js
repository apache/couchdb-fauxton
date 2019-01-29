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

  const defaultProps = {
    removeItem: () => {},
    allDocumentsSelected: false,
    hasSelectedItem: false,
    toggleSelectAll: () => {},
    isLoading: false,
    queryOptionsParams: {},
    databaseName: 'mydb',
    fetchUrl: '/db1/_all_docs',
    docType: Constants.INDEX_RESULTS_DOC_TYPE.VIEW,
    hasResults: true,
    resultsStyle: {
      textOverflow: Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_TRUNCATED,
      fontSize: Constants.INDEX_RESULTS_STYLE.FONT_SIZE_MEDIUM
    },
    updateResultsStyle: () => {}
  };

  beforeEach(() => {
    sinon.stub(FauxtonAPI, 'urls').withArgs('new').returns('mock-url');
  });

  afterEach(() => {
    utils.restore(FauxtonAPI.urls);
  });

  it('renders all content when there are results and they are deletable', () => {
    const wrapper = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={true} />
    );
    expect(wrapper.find('.bulk-action-component').length).toBe(1);
    expect(wrapper.find('div.two-sides-toggle-button').length).toBe(1);
    expect(wrapper.find('.document-result-screen__toolbar-create-btn').length).toBe(1);
  });

  it('does not render bulk action component when list is not deletable', () => {
    const wrapper = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={false} />
    );
    expect(wrapper.find('.bulk-action-component').length).toBe(0);
    expect(wrapper.find('div.two-sides-toggle-button').length).toBe(1);
    expect(wrapper.find('.document-result-screen__toolbar-create-btn').length).toBe(1);
  });

  it('includes default partition key when one is selected', () => {
    const wrapper = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={false}
      partitionKey={'partKey1'} />);
    expect(wrapper.find('a.document-result-screen__toolbar-create-btn').prop('href')).toMatch(/\?partitionKey=partKey1$/);
  });

  it('toggles display density', () => {
    const mockUpdateStyle = sinon.spy();
    const wrapper = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={false}
      updateResultsStyle={mockUpdateStyle}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}/>
    );
    wrapper.find('a.icon').first().simulate('click');
    sinon.assert.calledWith(mockUpdateStyle, { textOverflow: Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_FULL});
  });

  it('switches font size', () => {
    const mockUpdateStyle = sinon.spy();
    const wrapper = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={false}
      updateResultsStyle={mockUpdateStyle}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}/>
    );
    wrapper.find('a.icon').at(1).simulate('click');
    sinon.assert.calledWith(mockUpdateStyle, { fontSize: Constants.INDEX_RESULTS_STYLE.FONT_SIZE_SMALL});

    wrapper.find('a.icon').at(2).simulate('click');
    sinon.assert.calledWith(mockUpdateStyle, { fontSize: Constants.INDEX_RESULTS_STYLE.FONT_SIZE_MEDIUM});

    wrapper.find('a.icon').at(3).simulate('click');
    sinon.assert.calledWith(mockUpdateStyle, { fontSize: Constants.INDEX_RESULTS_STYLE.FONT_SIZE_LARGE});
  });

  it('does not show Display Density option in JSON layout', () => {
    const toolbarJson = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={false}
      selectedLayout={Constants.LAYOUT_ORIENTATION.JSON}/>
    );
    expect(toolbarJson.find('li.header-label').text()).toBe('Font size');

    const toolbarMetadata = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={false}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}/>
    );
    expect(toolbarMetadata.find('li.header-label').at(0).text()).toBe('Display density');
    expect(toolbarMetadata.find('li.header-label').at(1).text()).toBe('Font size');

    const toolbarTable = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={false}
      selectedLayout={Constants.LAYOUT_ORIENTATION.TABLE}/>
    );
    expect(toolbarTable.find('li.header-label').at(0).text()).toBe('Display density');
    expect(toolbarTable.find('li.header-label').at(1).text()).toBe('Font size');
  });

  it('shows Table, Metadata and JSON modes when querying a global view', () => {
    const wrapper = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={false}
      partitionKey={''}
      fetchUrl='/my_db/_design/ddoc1/_view/view1'/>);
    expect(wrapper.find('button')).toHaveLength(4);
  });

  it('shows Table, Metadata and JSON modes when querying a partitioned view', () => {
    const wrapper = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={false}
      partitionKey={'partKey1'}
      fetchUrl='/my_db/_partition/my_partition/_design/ddoc1/_view/view1'/>);
    expect(wrapper.find('button')).toHaveLength(4);
  });

  it('shows Table, Metadata and JSON modes when showing All Documents filtered by partition', () => {
    const wrapper = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={false}
      partitionKey={'partKey1'}
      fetchUrl='/my_db/_all_docs'/>);
    expect(wrapper.find('button')).toHaveLength(4);
  });
});
