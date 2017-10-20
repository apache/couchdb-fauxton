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
import FauxtonAPI from "../../../core/api";
import TableRow from "../index-results/components/results/TableRow";
import utils from "../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import sinon from "sinon";
import { shallow } from 'enzyme';

FauxtonAPI.router = new FauxtonAPI.Router([]);
const { assert } = utils;

describe('Docs Table Row', () => {

  it('all types of value are converted to the appropriate text for display', () => {
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
    const wrapper = shallow(<TableRow
      onClick={sinon.stub()}
      docChecked={sinon.stub()}
      isSelected={sinon.stub()}
      el={elem}
      data={data}
      index={0}
      docIdentifier={elem.id}
      isSelected={false}
    />);

    assert.equal(wrapper.find('td').at(2).text(), JSON.stringify(elem.content.vBool));
    assert.equal(wrapper.find('td').at(3).text(), elem.content.vString);
    assert.equal(wrapper.find('td').at(4).text(), JSON.stringify(elem.content.vFloat));
    assert.equal(wrapper.find('td').at(5).text(), JSON.stringify(elem.content.vInt));
    assert.equal(wrapper.find('td').at(6).text().replace(/[\s]/g, ''), JSON.stringify(elem.content.vObject));
  });
});
