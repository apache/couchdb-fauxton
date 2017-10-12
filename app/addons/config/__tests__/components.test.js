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
import Stores from "../stores";
import utils from "../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import {mount} from 'enzyme';
import sinon from "sinon";

FauxtonAPI.router = new FauxtonAPI.Router([]);
const assert = utils.assert;
const configStore = Stores.configStore;

describe('Config Components', () => {
  describe('ConfigTableController', () => {
    let elm, node;

    beforeEach(() => {
      configStore._loading = false;
      configStore._sections = {};
      node = 'node2@127.0.0.1';
      elm = mount(
        <Views.ConfigTableController node={node}/>
      );
    });

    it('deletes options', () => {
      const spy = sinon.stub(Actions, 'deleteOption');
      var option = {};

      elm.instance().deleteOption(option);
      assert.ok(spy.calledWith(node, option));
    });

    it('saves options', () => {
      const spy = sinon.stub(Actions, 'saveOption');
      var option = {};

      elm.instance().saveOption(option);
      assert.ok(spy.calledWith(node, option));
    });

    it('edits options', () => {
      const spy = sinon.stub(Actions, 'editOption');
      var option = {};

      elm.instance().editOption(option);
      assert.ok(spy.calledWith(option));
    });

    it('cancels editing', () => {
      const spy = sinon.stub(Actions, 'cancelEdit');

      elm.instance().cancelEdit();
      assert.ok(spy.calledOnce);
    });
  });

  describe('ConfigOption', () => {

    it('renders section name if the option is a header', () => {
      const option = {
        sectionName: 'test_section',
        optionName: 'test_option',
        value: 'test_value',
        header: true
      };

      const el = mount(<Views.ConfigOption option={option}/>);
      assert.equal(el.find('th').text(), 'test_section');
    });
  });

  describe('ConfigOptionValue', () => {
    it('displays the value prop', () => {
      const el = mount(
        <Views.ConfigOptionValue value={'test_value'}/>
      );

      assert.equal(el.text(), 'test_value');
    });

    it('starts editing when clicked', () => {
      const spy = sinon.spy();
      const el = mount(
        <Views.ConfigOptionValue value={'test_value'} onEdit={spy}/>
      );

      el.simulate('click');
      assert.ok(spy.calledOnce);
    });

    it('displays editing controls if editing', () => {
      const el = mount(
        <Views.ConfigOptionValue value={'test_value'} editing/>
      );

      assert.equal(el.find('input.config-value-input').length, 1);
      assert.equal(el.find('button.btn-config-cancel').length, 1);
      assert.equal(el.find('button.btn-config-save').length, 1);
    });

    it('disables input when save clicked', () => {
      const el = mount(
        <Views.ConfigOptionValue value={'test_value'} editing/>
      );

      el.find('input.config-value-input').simulate('change', {target: {value: 'value'}});
      el.find('button.btn-config-save').simulate('click');
      assert.ok(el.find('input.config-value-input').prop('disabled'));
    });

    it('saves changed value of input when save clicked', () => {
      var change = { target: { value: 'new_value' } };
      const spy = sinon.spy();
      const el = mount(
        <Views.ConfigOptionValue value={'test_value'} editing onSave={spy}/>
      );

      el.find('input.config-value-input').simulate('change', change);
      el.find('button.btn-config-save').simulate('click');
      assert.ok(spy.calledWith('new_value'));
    });

    it('cancels edit if save clicked with unchanged value', () => {
      const spy = sinon.spy();
      const el = mount(
        <Views.ConfigOptionValue value={'test_value'} editing onCancelEdit={spy}/>
      );

      el.find('button.btn-config-save').simulate('click');
      assert.ok(spy.calledOnce);
    });
  });

  describe('ConfigOptionTrash', () => {

    it.skip('displays delete modal when clicked', () => {
      const el = mount(
        <Views.ConfigOptionTrash sectionName='test_section' optionName='test_option'/>
      );

      el.simulate('click');
      // assert.equal($('div.confirmation-modal').length, 1);
    });

    it.skip('calls on delete when confirmation modal Okay button clicked', () => {
      const spy = sinon.spy();
      const el = mount(
        <Views.ConfigOptionTrash onDelete={spy}/>
      );

      el.simulate('click');
      // TestUtils.Simulate.click($('div.confirmation-modal button.btn-primary')[0]);
      assert.ok(spy.calledOnce);
    });
  });

  describe('AddOptionController', () => {
    let elm;

    beforeEach(() => {
      elm = mount(
        <Views.AddOptionController node='node2@127.0.0.1'/>
      );
    });

    it('adds options', () => {
      const spy = sinon.stub(Actions, 'addOption');

      elm.instance().addOption();
      assert.ok(spy.calledOnce);
    });
  });

  //we need enzyme to support portals for this
  describe.skip('AddOptionButton', () => {
    it('displays add option controls when clicked', () => {
      const el = mount(
        <Views.AddOptionButton/>
      );

      el.find('button#add-option-button').simulate('click');
      assert.equal($('div#add-option-popover .input-section-name').length, 1);
      assert.equal($('div#add-option-popover .input-option-name').length, 1);
      assert.equal($('div#add-option-popover .input-value').length, 1);
      assert.equal($('div#add-option-popover .btn-create').length, 1);
    });

    it('does not hide popover if create clicked with invalid input', () => {
      const el = mount(
        <Views.AddOptionButton/>
      );

      el.find('button#add-option-button').simulate('click');
      // TestUtils.Simulate.click($('div#add-option-popover .btn-create')[0]);
      assert.equal($('div#add-option-popover').length, 1);
    });

    it('does not add option if create clicked with invalid input', () => {
      const el = mount(
        <Views.AddOptionButton/>
      );

      el.find('button#add-option-button').simulate('click');
      // TestUtils.Simulate.click($('div#add-option-popover .btn-create')[0]);
      assert.equal($('div#add-option-popover').length, 1);
    });


    it('does adds option if create clicked with valid input', () => {
      const el = mount(
        <Views.AddOptionButton/>
      );

      el.find('button#add-option-button').simulate('click');
      // TestUtils.Simulate.click($('div#add-option-popover .btn-create')[0]);
      assert.equal($('div#add-option-popover').length, 1);
    });

    it('adds option when create clicked with valid input', () => {
      const spy = sinon.spy();
      const el = mount(
        <Views.AddOptionButton onAdd={spy}/>
      );

      el.find('button#add-option-button').simulate('click');
      // TestUtils.Simulate.change($('div#add-option-popover .input-section-name')[0], { target: { value: 'test_section' } });
      // TestUtils.Simulate.change($('div#add-option-popover .input-option-name')[0], { target: { value: 'test_option' } });
      // TestUtils.Simulate.change($('div#add-option-popover .input-value')[0], { target: { value: 'test_value' } });
      // TestUtils.Simulate.click($('div#add-option-popover .btn-create')[0]);
      assert.ok(spy.calledWith(sinon.match({
        sectionName: 'test_section',
        optionName: 'test_option',
        value: 'test_value'
      })));
    });
  });
});
