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
import {mount} from 'enzyme';
import sinon from 'sinon';
import FauxtonAPI from '../../../core/api';
import AddOptionButton from '../components/AddOptionButton';
import ConfigOption from '../components/ConfigOption';
import ConfigOptionValue from '../components/ConfigOptionValue';
import ConfigOptionTrash from '../components/ConfigOptionTrash';
import ConfigTableScreen from '../components/ConfigTableScreen';
// import Actions from '../actions';
import utils from '../../../../test/mocha/testUtils';

FauxtonAPI.router = new FauxtonAPI.Router([]);
const assert = utils.assert;

describe('Config Components', () => {
  describe('ConfigTableScreen', () => {
    const options = [
      {editing: false, header:true, sectionName: 'sec1', optionName: 'opt1', value: 'value1'},
      {editing: false, header:false, sectionName: 'sec1', optionName: 'opt2', value: 'value2'}
    ];
    const node = 'test_node';
    const defaultProps = {
      saving: false,
      loading: false,
      deleteOption: () => {},
      saveOption: () => {},
      editOption: () => {},
      cancelEdit: () => {},
      fetchAndEditConfig: () => {},
      node,
      options
    };

    it('deletes options', () => {
      const spy = sinon.stub();
      const wrapper = mount(<ConfigTableScreen
        {...defaultProps}
        deleteOption={spy}/>
      );
      wrapper.instance().deleteOption({});
      sinon.assert.called(spy);
    });

    it('saves options', () => {
      const spy = sinon.stub();
      const wrapper = mount(<ConfigTableScreen
        {...defaultProps}
        saveOption={spy}/>
      );
      wrapper.instance().saveOption({});
      sinon.assert.called(spy);
    });

    it('edits options', () => {
      const spy = sinon.stub();
      const wrapper = mount(<ConfigTableScreen
        {...defaultProps}
        editOption={spy}/>
      );
      wrapper.instance().editOption({});
      sinon.assert.called(spy);
    });

    it('cancels editing', () => {
      const spy = sinon.stub();
      const wrapper = mount(<ConfigTableScreen
        {...defaultProps}
        cancelEdit={spy}/>
      );
      wrapper.instance().cancelEdit();
      sinon.assert.called(spy);
    });
  });

  describe('ConfigOption', () => {
    const defaultProps = {
      option: {},
      saving: false,
      onEdit: () => {},
      onCancelEdit: () => {},
      onSave: () => {},
      onDelete: () => {}
    };
    it('renders section name if the option is a header', () => {
      const option = {
        sectionName: 'test_section',
        optionName: 'test_option',
        value: 'test_value',
        header: true,
        editing: true
      };

      const el = mount(<table><tbody><ConfigOption {...defaultProps} option={option}/></tbody></table>);
      assert.equal(el.find('th').text(), 'test_section');
    });
  });

  describe('ConfigOptionValue', () => {
    const defaultProps = {
      value: '',
      editing: false,
      onEdit: () => {},
      onCancelEdit: () => {},
      onSave: () => {}
    };

    it('displays the value prop', () => {
      const el = mount(
        <table><tbody><tr>
          <ConfigOptionValue {...defaultProps} value={'test_value'}/>
        </tr></tbody></table>
      );

      assert.equal(el.text(), 'test_value');
    });

    it('starts editing when clicked', () => {
      const spy = sinon.spy();
      const el = mount(
        <table><tbody><tr>
          <ConfigOptionValue {...defaultProps} value={'test_value'} onEdit={spy}/>
        </tr></tbody></table>
      );

      el.find(ConfigOptionValue).simulate('click');
      assert.ok(spy.calledOnce);
    });

    it('displays editing controls if editing', () => {
      const el = mount(
        <table><tbody><tr>
          <ConfigOptionValue {...defaultProps} value={'test_value'} editing/>
        </tr></tbody></table>
      );

      assert.equal(el.find('input.config-value-input').length, 1);
      assert.equal(el.find('button.btn-config-cancel').length, 1);
      assert.equal(el.find('button.btn-config-save').length, 1);
    });

    it('disables input when saving is set to true', () => {
      const el = mount(
        <table><tbody><tr>
          <ConfigOptionValue {...defaultProps} value={'test_value'} editing={true} saving={true}/>
        </tr></tbody></table>
      );

      assert.ok(el.find('input.config-value-input').prop('disabled'));
    });

    it('saves changed value of input when save clicked', () => {
      var change = { target: { value: 'new_value' } };
      const spy = sinon.spy();
      const el = mount(
        <table><tbody><tr>
          <ConfigOptionValue {...defaultProps} value={'test_value'} editing onSave={spy}/>
        </tr></tbody></table>
      );

      el.find('input.config-value-input').simulate('change', change);
      el.find('button.btn-config-save').simulate('click');
      assert.ok(spy.calledWith('new_value'));
    });

    it('cancels edit if save clicked with unchanged value', () => {
      const spy = sinon.spy();
      const el = mount(
        <table><tbody><tr>
          <ConfigOptionValue {...defaultProps} value={'test_value'} editing onCancelEdit={spy}/>
        </tr></tbody></table>
      );

      el.find('button.btn-config-save').simulate('click');
      assert.ok(spy.calledOnce);
    });
  });

  describe('ConfigOptionTrash', () => {

    it.skip('displays delete modal when clicked', () => {
      const el = mount(
        <ConfigOptionTrash sectionName='test_section' optionName='test_option'/>
      );

      el.simulate('click');
      // assert.equal($('div.confirmation-modal').length, 1);
    });

    it.skip('calls on delete when confirmation modal Okay button clicked', () => {
      const spy = sinon.spy();
      const el = mount(
        <ConfigOptionTrash onDelete={spy}/>
      );

      el.simulate('click');
      // TestUtils.Simulate.click($('div.confirmation-modal button.btn-primary')[0]);
      assert.ok(spy.calledOnce);
    });
  });

  //we need enzyme to support portals for this
  describe.skip('AddOptionButton', () => {
    it('adds options', () => {
      const spy = sinon.stub();
      const wrapper = mount(
        <AddOptionButton onAdd={spy}/>
      );
      wrapper.instance().onAdd();
      assert.ok(spy.calledOnce);
    });
  });

  //we need enzyme to support portals for this
  describe.skip('AddOptionButton', () => {
    it('displays add option controls when clicked', () => {
      const el = mount(
        <AddOptionButton/>
      );

      el.find('button#add-option-button').simulate('click');
      assert.equal($('div#add-option-popover .input-section-name').length, 1);
      assert.equal($('div#add-option-popover .input-option-name').length, 1);
      assert.equal($('div#add-option-popover .input-value').length, 1);
      assert.equal($('div#add-option-popover .btn-create').length, 1);
    });

    it('does not hide popover if create clicked with invalid input', () => {
      const el = mount(
        <AddOptionButton/>
      );

      el.find('button#add-option-button').simulate('click');
      // TestUtils.Simulate.click($('div#add-option-popover .btn-create')[0]);
      assert.equal($('div#add-option-popover').length, 1);
    });

    it('does not add option if create clicked with invalid input', () => {
      const el = mount(
        <AddOptionButton/>
      );

      el.find('button#add-option-button').simulate('click');
      // TestUtils.Simulate.click($('div#add-option-popover .btn-create')[0]);
      assert.equal($('div#add-option-popover').length, 1);
    });


    it('does adds option if create clicked with valid input', () => {
      const el = mount(
        <AddOptionButton/>
      );

      el.find('button#add-option-button').simulate('click');
      // TestUtils.Simulate.click($('div#add-option-popover .btn-create')[0]);
      assert.equal($('div#add-option-popover').length, 1);
    });

    it('adds option when create clicked with valid input', () => {
      const spy = sinon.spy();
      const el = mount(
        <AddOptionButton onAdd={spy}/>
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
