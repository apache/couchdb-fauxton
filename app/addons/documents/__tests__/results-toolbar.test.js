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
import { act } from 'react-dom/test-utils';

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
    expect(wrapper.find('Button#create-new-doc-btn').length).toBe(1);
  });

  it('does not render bulk action component when list is not deletable', () => {
    const wrapper = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={false} />
    );
    expect(wrapper.find('.bulk-action-component').length).toBe(0);
    expect(wrapper.find('div.two-sides-toggle-button').length).toBe(1);
    expect(wrapper.find('Button#create-new-doc-btn').length).toBe(1);
  });

  it('includes default partition key when one is selected', () => {
    const wrapper = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={false}
      partitionKey={'partKey1'} />);
    expect(wrapper.find('Button#create-new-doc-btn').prop('href')).toMatch(/\?partitionKey=partKey1$/);
  });

  it('toggles display density', async() => {
    // i.e. 'show full values'/'truncate values'
    const mockUpdateStyle = sinon.spy();
    const wrapper = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={false}
      updateResultsStyle={mockUpdateStyle}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}/>
    );

    // expand the dropdown
    const dropdownButton = wrapper.find('#result-style-menu button.dropdown-toggle');
    dropdownButton.simulate('click');
    await act(async () => {
      wrapper.update();
    });

    // 'show full values'
    const smallButton = wrapper.find('DropdownItem button').at(0);
    smallButton.simulate('click');
    await act(async () => {
      wrapper.update();
    });

    sinon.assert.calledWith(mockUpdateStyle, { textOverflow: Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_FULL});
  });

  it('switches font size', async() => {
    const mockUpdateStyle = sinon.spy();
    const wrapper = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={false}
      updateResultsStyle={mockUpdateStyle}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}/>
    );

    // expand the dropdown
    const dropdownButton = wrapper.find('#result-style-menu button.dropdown-toggle');
    dropdownButton.simulate('click');
    await act(async () => {
      wrapper.update();
    });

    // get the 'small' button
    const smallButton = wrapper.find('DropdownItem button').at(1);
    smallButton.simulate('click');
    sinon.assert.calledWith(mockUpdateStyle, { fontSize: Constants.INDEX_RESULTS_STYLE.FONT_SIZE_SMALL});

    // get the 'medium' button
    const mediumButton = wrapper.find('DropdownItem button').at(2);
    mediumButton.simulate('click');
    sinon.assert.calledWith(mockUpdateStyle, { fontSize: Constants.INDEX_RESULTS_STYLE.FONT_SIZE_MEDIUM});

    // get the 'medium' button
    const largeButton = wrapper.find('DropdownItem button').at(3);
    largeButton.simulate('click');
    sinon.assert.calledWith(mockUpdateStyle, { fontSize: Constants.INDEX_RESULTS_STYLE.FONT_SIZE_LARGE});
  });

  it('does not show Display Density option in JSON layout', async() => {
    const toolbarJson = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={false}
      selectedLayout={Constants.LAYOUT_ORIENTATION.JSON}/>
    );

    // expand the dropdown
    const dropdownButton = toolbarJson.find('#result-style-menu button.dropdown-toggle');
    dropdownButton.simulate('click');
    await act(async () => {
      toolbarJson.update();
    });

    expect(toolbarJson.find('DropdownHeader div.dropdown-header').text()).toBe('Font size');

  });

  it('shows Display Density and Font Size options in Metadata layout', async() => {
    const wrapper = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={false}
      selectedLayout={Constants.LAYOUT_ORIENTATION.METADATA}/>
    );

    // expand the dropdown
    const dropdownButton = wrapper.find('#result-style-menu button.dropdown-toggle');
    dropdownButton.simulate('click');
    await act(async () => {
      wrapper.update();
    });

    expect(wrapper.find('DropdownHeader div.dropdown-header').at(0).text()).toBe('Display density');
    expect(wrapper.find('DropdownHeader div.dropdown-header').at(1).text()).toBe('Font size');
  });

  it('shows Display Density and Font Size options in Table layout', async() => {
    const wrapper = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={false}
      selectedLayout={Constants.LAYOUT_ORIENTATION.TABLE}/>
    );

    // expand the dropdown
    const dropdownButton = wrapper.find('#result-style-menu button.dropdown-toggle');
    dropdownButton.simulate('click');
    await act(async () => {
      wrapper.update();
    });

    expect(wrapper.find('DropdownHeader div.dropdown-header').at(0).text()).toBe('Display density');
    expect(wrapper.find('DropdownHeader div.dropdown-header').at(1).text()).toBe('Font size');
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
