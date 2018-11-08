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
import ResultsOptions from '../components/results-options';
import Constants from '../constants';

describe('Results Options', () => {

  const defaultProps = {
    resultsStyle: {
      textOverflow: Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_TRUNCATED,
      fontSize: Constants.INDEX_RESULTS_STYLE.FONT_SIZE_MEDIUM
    },
    updateStyle: () => {}
  };

  it('calls updateStyle when one of the options is clicked', () => {
    const mockUpdateStyle = sinon.spy();
    const wrapper = mount(<ResultsOptions
      {...defaultProps}
      updateStyle={mockUpdateStyle}/>
    );
    wrapper.find('a.icon').at(0).simulate('click');
    sinon.assert.called(mockUpdateStyle);
  });

  it('shows the two sections by default', () => {
    const wrapper = mount(<ResultsOptions
      {...defaultProps} />
    );
    expect(wrapper.find('li.header-label').length).toBe(2);
  });

  it('hides Display Density when prop is set to false', () => {
    const wrapper = mount(<ResultsOptions
      {...defaultProps}
      showDensity={false} />
    );
    expect(wrapper.find('li.header-label').length).toBe(1);
    expect(wrapper.find('li.header-label').text()).toBe('Font size');
  });

  it('hides Font Size when prop is set to false', () => {
    const wrapper = mount(<ResultsOptions
      {...defaultProps}
      showFontSize={false} />
    );
    expect(wrapper.find('li.header-label').length).toBe(1);
    expect(wrapper.find('li.header-label').text()).toBe('Display density');
  });
});
