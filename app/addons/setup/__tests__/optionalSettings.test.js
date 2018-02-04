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
import utils from "../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import OptionalSettings from '../components/OptionalSettings';
import sinon from "sinon";
import {mount} from 'enzyme';

const assert = utils.assert;

//this was commented out. I imagine it needs to be updated
describe.skip('Setup Components', () => {

  describe('IP / Port area', () => {

    it('fires callbacks on change, ip', () => {
      const bindAddressHandler = sinon.spy();
      const optSettings = mount(<OptionalSettings onAlterPort={null} onAlterBindAddress={bindAddressHandler}
        ip='0.0.0.0' port='5984'/>);

      optSettings.find('.setup-input-ip').simulate('change', {target: {value: 'Hello, world'}});
      assert.ok(bindAddressHandler.calledOnce);

    });

    it('fires callbacks on change, port', () => {
      const changeHandler = sinon.spy();
      const optSettings = mount(
        <OptionalSettings onAlterPort={changeHandler} onAlterBindAddress={null} ip='0.0.0.0' port='5984'/>
      );

      optSettings.find('.setup-input-port').simulate('change', {target: {value: 'Hello, world'}});
      assert.ok(changeHandler.calledOnce);
    });

  });

});
