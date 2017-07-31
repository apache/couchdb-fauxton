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
import Views from "../components";
import Actions from "../actions";
import Resources from "../resources";
import Stores from "../stores";
import utils from "../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import sinon from "sinon";
import { shallow, mount } from 'enzyme';

FauxtonAPI.router = new FauxtonAPI.Router([]);
const {assert, restore} = utils;
const corsStore = Stores.corsStore;

describe('CORS Components', () => {

  describe('CorsController', () => {

    beforeEach(() => {
      corsStore._origins = ['http://hello.com'];
      corsStore._node = 'node2@127.0.0.1';
      corsStore._isEnabled = true;
      corsStore._configChanged = true;
    });

    afterEach(() => {
      restore(window.confirm);
    });

    it('confirms user change from restricted origin to disabled cors', () => {
      const spy = sinon.stub(window, 'confirm');
      spy.returns(false);

      const wrapper = shallow(<Views.CORSController />);
      wrapper.find('#bt-enable-disable-cors').simulate('click');
      assert.ok(spy.calledOnce);
    });

    it('does not confirm user change to disable cors when restricted origins are empty', () => {
      const spy = sinon.stub(window, 'confirm');
      spy.returns(false);

      // Set selected origins to empty
      corsStore._origins = [];

      const wrapper = shallow(<Views.CORSController />);
      wrapper.find('#bt-enable-disable-cors').simulate('click');
      assert.ok(spy.notCalled);
    });

    it('confirms user change when moving from selected origins to all origins', () => {
      const spy = sinon.stub(window, 'confirm');
      spy.returns(false);

      const wrapper = mount(<Views.CORSController />);
      wrapper.find('input').at(0).simulate('change', {target: {checked: true, value: 'all'}});
      assert.ok(spy.calledOnce);
    });

    it('does not confirm all origins change if selected origins are emtpy', () => {
      const spy = sinon.stub(window, 'confirm');
      spy.returns(false);

      // Set selected origins to empty
      corsStore._origins = [];

      const wrapper = mount(<Views.CORSController />);
      wrapper.find('input').at(0).simulate('change', {target: {checked: true, value: 'all'}});
      assert.notOk(spy.calledOnce);
    });

    it('shows loading bars', () => {
      const wrapper = mount(<Views.CORSController />);
      Actions.toggleLoadingBarsToEnabled(true);
      assert.ok(wrapper.find('.loading-lines').exists());
    });

    it('hides loading bars', () => {
      const wrapper = mount(<Views.CORSController />);
      Actions.toggleLoadingBarsToEnabled(false);
      assert.notOk(wrapper.find('.loading-lines').exists());
    });
  });

  describe('OriginInput', () => {
    const newOrigin = 'http://new-site.com';

    it('calls validates each domain', () => {
      const spyValidateCORSDomain = sinon.spy(Resources, 'validateCORSDomain');
      const addOriginStub = sinon.stub();
      const wrapper = shallow(<Views.OriginInput isVisible={true} addOrigin={addOriginStub}/>);

      wrapper.find('input').simulate('change', {target: {value: newOrigin}});
      wrapper.find('.btn').simulate('click', {preventDefault: sinon.stub()});
      assert.ok(spyValidateCORSDomain.calledWith(newOrigin));
    });

    it('calls addOrigin on add click with valid domain', () => {
      const addOriginSpy = sinon.spy();
      const wrapper = shallow(<Views.OriginInput isVisible={true} addOrigin={addOriginSpy}/>);

      wrapper.find('input').simulate('change', {target: {value: newOrigin}});
      wrapper.find('.btn').simulate('click', {preventDefault: sinon.stub()});
      assert.ok(addOriginSpy.calledWith(newOrigin));
    });

    it('shows notification if origin is not valid', () => {
      const spyAddNotification = sinon.spy(FauxtonAPI, 'addNotification');
      const wrapper = shallow(<Views.OriginInput isVisible={true} addOrigin={sinon.stub()}/>);

      wrapper.find('input').simulate('change', {target: {value: 'badOrigin'}});
      wrapper.find('.btn').simulate('click', {preventDefault: sinon.stub()});
      assert.ok(spyAddNotification.calledOnce);
    });
  });

  describe('Origins', () => {
    const spyChangeOrigin = sinon.spy();

    afterEach(() => {
      spyChangeOrigin.reset();
    });

    it('calls changeOrigin() when you switch from "Select List of Origins" to "Allow All Origins"', () => {
      const wrapper = shallow(<Views.Origins corsEnabled={true} isAllOrigins={false} originChange={spyChangeOrigin}/>);

      wrapper.find('input[value="all"]').simulate('change', {target: {checked: true, value: 'all'}});
      assert.ok(spyChangeOrigin.calledWith(true));
    });

    it('calls changeOrigin() when you switch from "Allow All Origins" to "Select List of Origins"', () => {
      const wrapper = shallow(<Views.Origins corsEnabled={true} isAllOrigins={true} originChange={spyChangeOrigin}/>);

      wrapper.find('input[value="selected"]').simulate('change', {target: {checked: true, value: 'selected'}});
      assert.ok(spyChangeOrigin.calledWith(false));
    });
  });

  describe('OriginRow', () => {
    const spyUpdateOrigin = sinon.spy();
    let origin;

    beforeEach(() => {
      origin = 'https://hello.com';
    });

    afterEach(() => {
      spyUpdateOrigin.reset();
    });

    it('should show confirm modal on delete', () => {
      const wrapper = mount(<Views.OriginTable updateOrigin={spyUpdateOrigin} isVisible={true} origins={[origin]}/>);

      wrapper.find('.fonticon-trash').simulate('click', { preventDefault: sinon.stub() });
      assert.ok(corsStore.isDeleteDomainModalVisible());
    });

    it('does not throw error if origins is undefined', () => {
      mount(<Views.OriginTable updateOrigin={spyUpdateOrigin} isVisible={true} origins={false}/>);
    });

    it('should change origin to input on edit click, then hide input on 2nd click', () => {
      const wrapper = mount(<Views.OriginTable updateOrigin={spyUpdateOrigin} isVisible={true} origins={[origin]}/>);
      // Text input appears after clicking Edit
      wrapper.find('.fonticon-pencil').simulate('click', { preventDefault: sinon.stub() });
      assert.ok(wrapper.find('input').exists());

      // Text input is hidden after clicking Edit for the 2nd time
      wrapper.find('.fonticon-pencil').simulate('click', { preventDefault: sinon.stub() });
      assert.notOk(wrapper.find('input').exists());
    });

    it('should update origin on update clicked', () => {
      let updatedOrigin = 'https://updated-origin.com';
      const wrapper = mount(
        <Views.OriginTable
          updateOrigin={spyUpdateOrigin}
          isVisible={true} origins={[origin]}/>
      );

      wrapper.find('.fonticon-pencil').simulate('click', { preventDefault: sinon.stub() });
      wrapper.find('input').simulate('change', {target: {value: updatedOrigin}});
      wrapper.find('.btn').at(0).simulate('click', { preventDefault: sinon.stub() });
      assert.ok(spyUpdateOrigin.calledWith(updatedOrigin));
    });

    it('should not update origin on update clicked with bad origin', () => {
      let updatedOrigin = 'updated-origin';
      const wrapper = mount(
        <Views.OriginTable
          updateOrigin={spyUpdateOrigin}
          isVisible={true} origins={[origin]}/>
      );
      wrapper.find('.fonticon-pencil').simulate('click', { preventDefault: sinon.stub() });
      wrapper.find('input').simulate('change', {target: {value: updatedOrigin}});
      wrapper.find('.btn').at(0).simulate('click', { preventDefault: sinon.stub() });
      assert.notOk(spyUpdateOrigin.calledWith(updatedOrigin));
    });

  });

});
