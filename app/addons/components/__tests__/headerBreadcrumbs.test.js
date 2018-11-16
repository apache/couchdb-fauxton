// Licensed under the Apache License, Version 2.0 (the 'License'); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

import React from 'react';
import {mount} from 'enzyme';

import {Breadcrumbs} from '../header-breadcrumbs';

describe('Breadcrumbs', () => {
  it('should not inject dividers if 1 element present', () => {

    const crumbs = [{name: 'pineapple'}];

    let el = mount(
      <div><Breadcrumbs crumbs={crumbs} /></div>
    );

    expect(el.find('.faux-header__breadcrumbs-divider').length).toBe(0);
  });

  it('should inject 2 dividers if 3 elements present', () => {

    const crumbs = [
      {name: 'pineapple'},
      {name: 'mango'},
      {name: 'guayaba'}
    ];

    let el = mount(
      <div><Breadcrumbs crumbs={crumbs} /></div>
    );


    expect(el.find('.faux-header__breadcrumbs-divider').length).toBe(2);
  });

  it('linked breadcrumbs are possible', () => {

    const crumbs = [
      {name: 'pineapple'},
      {name: 'mango', link: 'http://example.com'},
      {name: 'guayaba'}
    ];

    let el = mount(
      <div><Breadcrumbs crumbs={crumbs} /></div>
    );

    expect(el.find('.faux-header__breadcrumbs-link').length).toBe(1);
  });

  it('linked breadcrumbs are not created for non-linked elements', () => {

    const crumbs = [
      {name: 'pineapple'},
      {name: 'mango'},
      {name: 'guayaba'}
    ];

    let el = mount(
      <div><Breadcrumbs crumbs={crumbs} /></div>
    );

    expect(el.find('.faux-header__breadcrumbs-link').length).toBe(0);
  });
});
