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

import { Accordion, AccordionItem } from '../components/accordion';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

describe('Accordion', () => {

  it('Shows and hides content after clicking on header', () => {
    const el = mount(
      <Accordion>
        <AccordionItem title={'Click to open'}>
          <p id="test_content">Have a great day</p>
        </AccordionItem>
      </Accordion>
    );

    expect(el.find('.faux--accordion__item-content').hasClass('in')).toBe(false);
    el.find('.faux--accordion__item-header').simulate('click');
    expect(el.find('.faux--accordion__item-content').hasClass('in')).toBe(true);
  });

  it('Calls onClick event', () => {
    const spy = sinon.spy();
    const el = mount(
      <Accordion>
        <AccordionItem title={'Click to open'} onClick={spy}>
          <p id="test_content">Have a great day</p>
        </AccordionItem>
      </Accordion>
    );

    el.find('.faux--accordion__item-header').simulate('click');
    sinon.assert.called(spy);
  });

});
