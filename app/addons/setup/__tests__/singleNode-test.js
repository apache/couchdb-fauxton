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
import Store from '../../../core/store';
import {mount} from 'enzyme';
import SingleNodeController from "../components/SingleNodeController";

const assert = utils.assert;

//this was commented out. I imagine it needs to be updated
describe('Setup Components', () => {

  describe.skip('SingleNodeSetup', () => {

    it('changes the values in the store for the setup node', () => {
      const props = {
        bindAddress: '0.0.0.0',
        port: 5984,
        username: 'foo',
        password: 'bar',
        isAdminParty: false
      };
      const controller = mount(
          <SingleNodeController {...props}/>
      );
      controller.find('.setup-setupnode-section .setup-input-ip').simulate('change', {target: {value: '192.168.13.42'}});
      controller.find('.setup-setupnode-section .setup-input-port').simulate('change', {target: {value: '1342'}});
      controller.find('.setup-setupnode-section .setup-username').simulate('change', {target: {value: 'tester'}});
      controller.find('.setup-setupnode-section .setup-password').simulate('change', {target: {value: 'testerpass'}});

      assert.equal(Store.setupStore.getBindAdressForSetupNode(), '192.168.13.42');
      assert.equal(Store.setupStore.getPortForSetupNode(), '1342');
      assert.equal(Store.setupStore.getUsername(), 'tester');
      assert.equal(Store.setupStore.getPassword(), 'testerpass');
    });

  });

});
