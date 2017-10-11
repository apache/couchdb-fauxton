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
import Views from "../setup";
import Stores from "../setup.stores";
import utils from "../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import sinon from "sinon";
import { mount } from 'enzyme';

const assert = utils.assert;

//this was commented out. I imagine it needs to be updated
describe.skip('Setup Components', () => {

  describe('IP / Port area', () => {

    it('fires callbacks on change, ip', () => {
      const changeHandler = sinon.spy();
      const optSettings = mount(<Views.SetupOptionalSettings onAlterPort={null} onAlterBindAddress={changeHandler} />);

      optSettings.find('.setup-input-ip').simulate('change', {target: {value: 'Hello, world'}});
      assert.ok(changeHandler.calledOnce);
    });

    it('fires callbacks on change, port', () => {
      const changeHandler = sinon.spy();
      var optSettings = mount(
        <Views.SetupOptionalSettings onAlterPort={changeHandler} onAlterBindAddress={null} />
      );

      optSettings.find('.setup-input-port').simulate('change', {target: {value: 'Hello, world'}});
      assert.ok(changeHandler.calledOnce);
    });

  });

  describe('SingleNodeSetup', () => {
    beforeEach(() => {
      sinon.stub(Stores.setupStore, 'getIsAdminParty', () => { return false; });
    });

    afterEach(() => {
      utils.restore(Stores.setupStore.getIsAdminParty);
      Stores.setupStore.reset();
    });

    it('changes the values in the store for the setup node', () => {
      const controller = mount(
        <Views.SetupSingleNodeController />
      );

      controller.find('.setup-setupnode-section .setup-input-ip').simulate('change', {target: {value: '192.168.13.42'}});
      controller.find('.setup-setupnode-section .setup-input-port').simulate('change', {target: {value: '1342'}});
      controller.find('.setup-setupnode-section .setup-username').simulate('change', {target: {value: 'tester'}});
      controller.find('.setup-setupnode-section .setup-password').simulate('change', {target: {value: 'testerpass'}});

      assert.equal(Stores.setupStore.getBindAdressForSetupNode(), '192.168.13.42');
      assert.equal(Stores.setupStore.getPortForSetupNode(), '1342');
      assert.equal(Stores.setupStore.getUsername(), 'tester');
      assert.equal(Stores.setupStore.getPassword(), 'testerpass');
    });

  });

});
