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
import * as Helpers from "../helpers";
import Views from "../components";
import utils from "../../../../test/mocha/testUtils";
import React from "react";
import sinon from "sinon";
import { shallow, mount } from 'enzyme';

FauxtonAPI.router = new FauxtonAPI.Router([]);
const { restore } = utils;

describe('CORS Components', () => {

  describe('CORSContainer tests', () => {

    afterEach(() => {
      restore(window.confirm);
    });

    it('confirms user change from restricted origin to disabled cors', () => {
      const spy = sinon.stub(window, 'confirm');
      spy.returns(false);

      const wrapper = shallow(<Views.CORSScreen
        corsEnabled={true}
        isAllOrigins={false}
        origins={['https://localhost']}
        saveCORS={sinon.stub()}
        showDeleteDomainConfirmation={sinon.stub()}
        fetchAndLoadCORSOptions={sinon.stub()}
        hideDeleteDomainConfirmation={sinon.stub()}
      />);

      wrapper.find('.enable-disable.btn').simulate('click');
      sinon.assert.calledOnce(spy);
    });

    it('does not confirm user change to disable cors when restricted origins are empty', () => {
      const spy = sinon.stub(window, 'confirm');
      spy.returns(false);

      const wrapper = shallow(<Views.CORSScreen
        corsEnabled={true}
        isAllOrigins={true}
        origins={[]}
        saveCORS={sinon.stub()}
        showDeleteDomainConfirmation={sinon.stub()}
        fetchAndLoadCORSOptions={sinon.stub()}
        hideDeleteDomainConfirmation={sinon.stub()}
      />);
      wrapper.find('.enable-disable.btn').simulate('click');
      sinon.assert.notCalled(spy);
    });

    it('confirms user change when moving from selected origins to all origins', () => {
      const spy = sinon.stub(window, 'confirm');
      spy.returns(false);

      const wrapper = mount(<Views.CORSScreen
        corsEnabled={true}
        isAllOrigins={false}
        origins={['http://localhost']}
        saveCORS={sinon.stub()}
        showDeleteDomainConfirmation={sinon.stub()}
        fetchAndLoadCORSOptions={sinon.stub()}
        hideDeleteDomainConfirmation={sinon.stub()}
      />);
      wrapper.find('input').at(0).simulate('change', { target: { checked: true, value: 'all' } });
      expect(spy.calledOnce).toBeTruthy();
    });

    it('does not confirm all origins change if selected origins are emtpy', () => {
      const spy = sinon.stub(window, 'confirm');
      spy.returns(false);

      const wrapper = mount(<Views.CORSScreen
        corsEnabled={true}
        isAllOrigins={false}
        origins={[]}
        saveCORS={sinon.stub()}
        showDeleteDomainConfirmation={sinon.stub()}
        fetchAndLoadCORSOptions={sinon.stub()}
        hideDeleteDomainConfirmation={sinon.stub()}
      />);
      wrapper.find('input').at(0).simulate('change', { target: { checked: true, value: 'all' } });
      expect(spy.calledOnce).toBeFalsy();
    });

    it('shows loading bars', () => {
      const wrapper = mount(<Views.CORSScreen
        isLoading={true}
        corsEnabled={true}
        isAllOrigins={false}
        origins={[]}
        saveCORS={sinon.stub()}
        showDeleteDomainConfirmation={sinon.stub()}
        fetchAndLoadCORSOptions={sinon.stub()}
        hideDeleteDomainConfirmation={sinon.stub()}
      />);

      expect(wrapper.find('.loading-lines').exists()).toBeTruthy();
    });

    it('hides loading bars', () => {
      const wrapper = mount(<Views.CORSScreen
        isLoading={false}
        corsEnabled={true}
        isAllOrigins={false}
        origins={[]}
        saveCORS={sinon.stub()}
        showDeleteDomainConfirmation={sinon.stub()}
        fetchAndLoadCORSOptions={sinon.stub()}
        hideDeleteDomainConfirmation={sinon.stub()}
      />);

      expect(wrapper.find('.loading-lines').exists()).toBe(false);
    });
  });

  describe('OriginInput', () => {
    const newOrigin = 'http://new-site.com';

    it('calls validates each domain', () => {
      const spyValidateDomain = sinon.spy(Helpers, 'validateDomain');
      const wrapper = shallow(<Views.OriginInput isVisible={true} addOrigin={sinon.stub()} />);

      wrapper.find('input').simulate('change', { target: { value: newOrigin } });
      wrapper.find('.btn').simulate('click', { preventDefault: sinon.stub() });
      expect(spyValidateDomain.called).toBeTruthy();
    });

    it('calls addOrigin on add click with valid domain', () => {
      const addOriginSpy = sinon.spy();
      const wrapper = mount(<Views.OriginInput isVisible={true} addOrigin={addOriginSpy} />);

      wrapper.find('input').simulate('change', { target: { value: newOrigin } });
      wrapper.find('.btn').simulate('click', { preventDefault: sinon.stub() });
      expect(addOriginSpy.calledWith(newOrigin)).toBeTruthy();
    });

    it('shows notification if origin is not valid', () => {
      const spyAddNotification = sinon.spy(FauxtonAPI, 'addNotification');
      const wrapper = shallow(<Views.OriginInput isVisible={true} addOrigin={sinon.stub()} />);

      wrapper.find('input').simulate('change', { target: { value: 'badOrigin' } });
      wrapper.find('.btn').simulate('click', { preventDefault: sinon.stub() });
      expect(spyAddNotification.calledOnce).toBeTruthy();
    });
  });

  describe('Origins', () => {
    const spyChangeOrigin = sinon.spy();

    afterEach(() => {
      spyChangeOrigin.resetHistory();
    });

    it('calls changeOrigin() when you switch from "Select List of Origins" to "Allow All Origins"', () => {
      const wrapper = shallow(<Views.Origins corsEnabled={true} isAllOrigins={false} originChange={spyChangeOrigin} />);

      wrapper.find('input[value="all"]').simulate('change', { target: { checked: true, value: 'all' } });
      expect(spyChangeOrigin.calledWith(true)).toBeTruthy();
    });

    it('calls changeOrigin() when you switch from "Allow All Origins" to "Select List of Origins"', () => {
      const wrapper = shallow(<Views.Origins corsEnabled={true} isAllOrigins={true} originChange={spyChangeOrigin} />);

      wrapper.find('input[value="selected"]').simulate('change', { target: { checked: true, value: 'selected' } });
      expect(spyChangeOrigin.calledWith(false)).toBeTruthy();
    });
  });

  describe('OriginRow', () => {
    const spyUpdateOrigin = sinon.spy();
    const spyDeleteOrigin = sinon.spy();
    let origin;

    beforeEach(() => {
      origin = 'https://hello.com';
    });

    afterEach(() => {
      spyUpdateOrigin.resetHistory();
      spyDeleteOrigin.resetHistory();
    });

    it('should call deleteOrigin on delete', () => {
      const wrapper = mount(<Views.OriginTable
        updateOrigin={spyUpdateOrigin}
        deleteOrigin={spyDeleteOrigin}
        isVisible={true}
        origins={[origin]} />);

      wrapper.find('.fonticon-trash').simulate('click', { preventDefault: sinon.stub() });
      expect(spyDeleteOrigin.calledOnce).toBeTruthy();
    });

    it('does not throw error if origins is undefined', () => {
      mount(<Views.OriginTable
        updateOrigin={spyUpdateOrigin}
        deleteOrigin={spyDeleteOrigin}
        isVisible={true}
        origins={undefined} />);
    });

    it('should change origin to input on edit click, then hide input on 2nd click', () => {
      const wrapper = mount(<Views.OriginTable
        updateOrigin={spyUpdateOrigin}
        deleteOrigin={spyDeleteOrigin}
        isVisible={true}
        origins={[origin]} />);

      // Text input appears after clicking Edit
      wrapper.find('.fonticon-pencil').simulate('click', { preventDefault: sinon.stub() });
      expect(wrapper.find('input').exists()).toBeTruthy();

      // Text input is hidden after clicking Edit for the 2nd time
      wrapper.find('.fonticon-pencil').simulate('click', { preventDefault: sinon.stub() });
      expect(wrapper.find('input').exists()).toBe(false);
    });

    it('should update origin on update clicked', () => {
      const updatedOrigin = 'https://updated-origin.com';
      const wrapper = mount(
        <Views.OriginTable
          updateOrigin={spyUpdateOrigin}
          deleteOrigin={spyDeleteOrigin}
          isVisible={true}
          origins={[origin]} />
      );

      wrapper.find('.fonticon-pencil').simulate('click', { preventDefault: sinon.stub() });
      wrapper.find('input').simulate('change', { target: { value: updatedOrigin } });
      wrapper.find('.btn').at(0).simulate('click', { preventDefault: sinon.stub() });
      expect(spyUpdateOrigin.calledWith(updatedOrigin)).toBeTruthy();
    });

    it('should not update origin on update clicked with bad origin', () => {
      const updatedOrigin = 'updated-origin';
      const wrapper = mount(
        <Views.OriginTable
          updateOrigin={spyUpdateOrigin}
          deleteOrigin={spyDeleteOrigin}
          isVisible={true}
          origins={[origin]} />
      );
      wrapper.find('.fonticon-pencil').simulate('click', { preventDefault: sinon.stub() });
      wrapper.find('input').simulate('change', { target: { value: updatedOrigin } });
      wrapper.find('.btn').at(0).simulate('click', { preventDefault: sinon.stub() });
      expect(spyUpdateOrigin.calledWith(updatedOrigin)).toBe(false);
    });

  });

});
