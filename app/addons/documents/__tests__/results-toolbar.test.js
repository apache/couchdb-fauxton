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

import sinon from "sinon";
import utils from "../../../../test/mocha/testUtils";
import FauxtonAPI from "../../../core/api";
import Constants from "../constants";
import {ResultsToolBar} from "../components/results-toolbar";
import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';

describe('Results Toolbar', () => {

  const defaultProps = {
    removeItem: () => {},
    allDocumentsSelected: false,
    hasSelectedItem: false,
    toggleSelectAll: () => {},
    isLoading: false,
    queryOptionsParams: {},
    setResultsTextOverflow: () => {},
    resultsStyle: {
      textOverflow: Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_TRUNCATED
    }
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

  it('toggles text overflow mode', () => {
    const mockSetTextOverflow = sinon.spy();
    const wrapper = mount(<ResultsToolBar
      {...defaultProps}
      hasResults={true}
      isListDeletable={false}
      setResultsTextOverflow={mockSetTextOverflow}/>
    );
    wrapper.find('div.text-overflow-switch input').first().simulate('change', { target: { checked: true } });
    expect(mockSetTextOverflow.called).toBe(true);
  });
});
