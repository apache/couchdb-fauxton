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
import { TabWindowWrapper } from "../components/tabwindowwrapper";
import { mount } from "enzyme";
import React from "react";
import ReactDOM from "react-dom";

describe('TabWindowWrapper', () => {
  const mock = () => {
    return (<div></div>);
  };

  const tabs = [
    {
      name: 'Tab1',
      component: mock,
      route: 'tab1'
    },
    {
      name: 'Tab2',
      component: mock,
      route: 'tab2'
    },
    {
      name: 'Tab3',
      component: mock,
      route: 'tab3'
    }
  ];

  it('shows all tabs', () => {
    const wrapper = mount(<TabWindowWrapper tabs={tabs} selectedTab={"Tab1"}/>);
    expect(wrapper.find('.component-tab-element-wrapper').length).toBe(1);
    expect(wrapper.find('.tab-element-content').length).toBe(3);
  });

  it('shows the selected tab', () => {
    const wrapper = mount(<TabWindowWrapper tabs={tabs} selectedTab={"Tab2"}/>);
    expect(wrapper.find('.tab-element-checked .tab-element-content').html()).toMatch(/Tab2/);
  });

  it('shows tab badge', () => {
    const tabNoBadge = [{name: 'Tab1', component: mock, route: 'tab1'}];
    const wrapperNoBadge = mount(<TabWindowWrapper tabs={tabNoBadge} selectedTab={"Tab1"}/>);
    expect(wrapperNoBadge.find('.tab-element-badge').length).toBe(0);

    const tabWithBadge = [{name: 'Tab1', component: mock, route: 'tab1', badgeText: 'new'}];
    const wrapperWithBadge = mount(<TabWindowWrapper tabs={tabWithBadge} selectedTab={"Tab1"}/>);
    expect(wrapperWithBadge.find('.tab-element-badge').length).toBe(1);
    expect(wrapperWithBadge.find('.tab-element-badge').text()).toBe('new');
  });
});
