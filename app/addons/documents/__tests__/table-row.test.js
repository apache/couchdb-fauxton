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

import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import FauxtonAPI from '../../../core/api';
import Constants from '../constants';
import TableRow from '../index-results/components/results/TableRow';

FauxtonAPI.router = new FauxtonAPI.Router([]);

describe('Docs Table Row', () => {

  const elem = {
    content: {
      _id: "123",
      vBool: true,
      vString: 'abc',
      vFloat: 123.1234,
      vInt: 123,
      vObject: { f1: 1, f2: 'b'},
    },
    id: "123"
  };

  const data = {
    selectedFields: ['vBool', 'vString', 'vFloat', 'vInt', 'vObject']
  };

  it('all types of value are converted to the appropriate text for display', () => {
    const wrapper = shallow(<TableRow
      onClick={sinon.stub()}
      docChecked={sinon.stub()}
      el={elem}
      data={data}
      index={0}
      docIdentifier={elem.id}
      isSelected={false}
    />);

    expect(wrapper.find('td').at(2).text()).toBe(JSON.stringify(elem.content.vBool));
    expect(wrapper.find('td').at(3).text()).toBe(elem.content.vString);
    expect(wrapper.find('td').at(4).text()).toBe(JSON.stringify(elem.content.vFloat));
    expect(wrapper.find('td').at(5).text()).toBe(JSON.stringify(elem.content.vInt));
    expect(wrapper.find('td').at(6).text().replace(/[\s]/g, '')).toBe(JSON.stringify(elem.content.vObject));
  });

  it('shows full text values', () => {
    const wrapper = shallow(<TableRow
      onClick={sinon.stub()}
      docChecked={sinon.stub()}
      el={elem}
      data={data}
      index={0}
      docIdentifier={elem.id}
      isSelected={false}
      textOverflow={Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_FULL}
    />);

    expect(wrapper.find('td.showall').exists()).toBe(true);
  });

  it('truncates text values', () => {
    const wrapper = shallow(<TableRow
      onClick={sinon.stub()}
      docChecked={sinon.stub()}
      el={elem}
      data={data}
      index={0}
      docIdentifier={elem.id}
      isSelected={false}
      textOverflow={Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_TRUNCATED}
    />);

    expect(wrapper.find('td.showall').exists()).toBe(false);
  });
});
