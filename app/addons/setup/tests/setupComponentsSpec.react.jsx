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
import Views from "../setup.react";
import Stores from "../setup.stores";
import utils from "../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import TestUtils from "react-addons-test-utils";
import sinon from "sinon";
import { mount } from 'enzyme';

var assert = utils.assert;

describe('Setup Components', function () {

  describe('IP / Port area', function () {

    it('fires callbacks on change, ip', function () {
      const changeHandler = sinon.spy();
      const optSettings = mount(<Views.SetupOptionalSettings onAlterPort={null} onAlterBindAddress={changeHandler} />);

      optSettings.find('.setup-input-ip').simulate('change', {target: {value: 'Hello, world'}});
      assert.ok(changeHandler.calledOnce);
    });

    it('fires callbacks on change, port', function () {
      const changeHandler = sinon.spy();
      var optSettings = mount(
        <Views.SetupOptionalSettings onAlterPort={changeHandler} onAlterBindAddress={null} />
      );

      optSettings.find('.setup-input-port').simulate('change', {target: {value: 'Hello, world'}});
      assert.ok(changeHandler.calledOnce);
    });

  });

  //commenting out for now. These tests cause other tests to fail. No idea why
  /*describe('SetupMultipleNodesController', function () {
    var controller, changeHandler, container;

    beforeEach(function () {
      sinon.stub(Stores.setupStore, 'getIsAdminParty', function () { return false; });
      container = document.createElement('div');
      controller = TestUtils.renderIntoDocument(
          <Views.SetupMultipleNodesController />,
        container
      );
    });

    afterEach(function () {
      utils.restore(Stores.setupStore.getIsAdminParty);
      ReactDOM.unmountComponentAtNode(container);
      Stores.setupStore.reset();
    });

    it('changes the values in the store for additional nodes', function () {
      var $addNodesSection = $(ReactDOM.findDOMNode(controller)).find('.setup-add-nodes-section');
      TestUtils.Simulate.change($addNodesSection.find('.setup-input-ip')[0], {target: {value: '192.168.13.37'}});
      TestUtils.Simulate.change($addNodesSection.find('.setup-input-port')[0], {target: {value: '1337'}});
      TestUtils.Simulate.change($addNodesSection.find('.input-remote-node')[0], {target: {value: 'node2.local'}});

      var additionalNode = Stores.setupStore.getAdditionalNode();
      assert.equal(additionalNode.bindAddress, '192.168.13.37');
      assert.equal(additionalNode.remoteAddress, 'node2.local');
      assert.equal(additionalNode.port, '1337');
    });

    it('changes the values in the store for the setup node', function () {
      var $setupNodesSection = $(ReactDOM.findDOMNode(controller)).find('.setup-setupnode-section');
      TestUtils.Simulate.change($setupNodesSection.find('.setup-input-ip')[0], {target: {value: '192.168.42.42'}});
      TestUtils.Simulate.change($setupNodesSection.find('.setup-input-port')[0], {target: {value: '4242'}});
      TestUtils.Simulate.change($setupNodesSection.find('.setup-username')[0], {target: {value: 'tester'}});
      TestUtils.Simulate.change($setupNodesSection.find('.setup-password')[0], {target: {value: 'testerpass'}});


      assert.equal(Stores.setupStore.getBindAdressForSetupNode(), '192.168.42.42');
      assert.equal(Stores.setupStore.getPortForSetupNode(), '4242');
      assert.equal(Stores.setupStore.getUsername(), 'tester');
      assert.equal(Stores.setupStore.getPassword(), 'testerpass');
    });

  });*/

  describe('SingleNodeSetup', function () {
    beforeEach(function () {
      sinon.stub(Stores.setupStore, 'getIsAdminParty', function () { return false; });
    });

    afterEach(function () {
      utils.restore(Stores.setupStore.getIsAdminParty);
      Stores.setupStore.reset();
    });

    it('changes the values in the store for the setup node', function () {
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
