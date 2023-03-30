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
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import {mount} from 'enzyme';
import sinon from 'sinon';
import reducer from '../reducers';
import FauxtonAPI from '../../../core/api';
import AddOptionButton from '../components/AddOptionButton';
import ConfigOption from '../components/ConfigOption';
import ConfigOptionValue from '../components/ConfigOptionValue';
import ConfigOptionTrash from '../components/ConfigOptionTrash';
import ConfigTableScreen from '../components/ConfigTableScreen';

FauxtonAPI.router = new FauxtonAPI.Router([]);

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
    let store;
    beforeEach(() => {
      store = createStore(
        combineReducers({ permissions: reducer})
      );
    });

    it('deletes options', () => {
      const spy = sinon.stub();
      const wrapper = mount(
        <Provider store={store}>
          <ConfigTableScreen
            {...defaultProps}
            deleteOption={spy}/>
        </Provider>
      );
      wrapper.find(ConfigTableScreen).instance().deleteOption({});
      sinon.assert.called(spy);
    });

    it('saves options', () => {
      const spy = sinon.stub();
      const wrapper = mount(
        <Provider store={store}>
          <ConfigTableScreen
            {...defaultProps}
            saveOption={spy}/>
        </Provider>
      );
      wrapper.find(ConfigTableScreen).instance().saveOption({});
      sinon.assert.called(spy);
    });

    it('edits options', () => {
      const spy = sinon.stub();
      const wrapper = mount(
        <Provider store={store}>
          <ConfigTableScreen
            {...defaultProps}
            editOption={spy}/>
        </Provider>
      );
      wrapper.find(ConfigTableScreen).instance().editOption({});
      sinon.assert.called(spy);
    });

    it('cancels editing', () => {
      const spy = sinon.stub();
      const wrapper = mount(
        <Provider store={store}>
          <ConfigTableScreen
            {...defaultProps}
            cancelEdit={spy}/>
        </Provider>
      );
      wrapper.find(ConfigTableScreen).instance().cancelEdit();
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
      expect(el.find('th').text()).toBe('test_section');
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

      expect(el.text()).toBe('test_value');
    });

    it('starts editing when clicked', () => {
      const spy = sinon.spy();
      const el = mount(
        <table><tbody><tr>
          <ConfigOptionValue {...defaultProps} value={'test_value'} onEdit={spy}/>
        </tr></tbody></table>
      );

      el.find(ConfigOptionValue).simulate('click');
      expect(spy.calledOnce).toBeTruthy();
    });

    it('displays editing controls if editing', () => {
      const el = mount(
        <table><tbody><tr>
          <ConfigOptionValue {...defaultProps} value={'test_value'} editing/>
        </tr></tbody></table>
      );

      expect(el.find('input.form-control').length).toBe(1);
      expect(el.find('button.btn-config-cancel').length).toBe(1);
      expect(el.find('button.btn-config-save').length).toBe(1);
    });

    it('disables input when saving is set to true', () => {
      const el = mount(
        <table><tbody><tr>
          <ConfigOptionValue {...defaultProps} value={'test_value'} editing={true} saving={true}/>
        </tr></tbody></table>
      );

      expect(el.find('input.form-control').prop('disabled')).toBe(true);
    });

    it('saves changed value of input when save clicked', () => {
      var change = { target: { value: 'new_value' } };
      const spy = sinon.spy();
      const el = mount(
        <table><tbody><tr>
          <ConfigOptionValue {...defaultProps} value={'test_value'} editing onSave={spy}/>
        </tr></tbody></table>
      );

      el.find('input.form-control').simulate('change', change);
      el.find('button.btn-config-save').simulate('click');
      expect(spy.calledWith('new_value')).toBeTruthy();
    });

    it('cancels edit if save clicked with unchanged value', () => {
      const spy = sinon.spy();
      const el = mount(
        <table><tbody><tr>
          <ConfigOptionValue {...defaultProps} value={'test_value'} editing onCancelEdit={spy}/>
        </tr></tbody></table>
      );

      el.find('button.btn-config-save').simulate('click');
      sinon.assert.calledOnce(spy);
    });
  });

  describe('ConfigOptionTrash', () => {
    const defaultProps = {
      sectionName: 'test_section',
      optionName: 'test_option',
      onDelete: () => {}
    };

    it('displays delete modal when clicked', () => {
      const el = mount(
        <table><tbody><tr><ConfigOptionTrash {...defaultProps}/></tr></tbody></table>
      );

      el.find('i.fonticon-trash').simulate('click');
      expect(el.find('div.confirmation-modal').length).toBe(1);
    });

    it('calls on delete when confirmation modal Okay button clicked', () => {
      const spy = sinon.spy();
      const el = mount(
        <table><tbody><tr><ConfigOptionTrash {...defaultProps} onDelete={spy}/></tr></tbody></table>
      );

      el.find('i.fonticon-trash').simulate('click');
      el.find('div.confirmation-modal .btn-cf-primary').simulate('click');
      sinon.assert.calledOnce(spy);
    });
  });

  describe('AddOptionButton', () => {
    it('displays add option controls when clicked', async() => {
      const el = mount(
        <AddOptionButton onAdd={() => {}}/>
      );

      el.find('button#add-option-button').simulate('click');
      await act(async () => {
        el.update();
      });
      expect(el.find('div#add-option-popover input[name="section"]').length).toBe(1);
      expect(el.find('div#add-option-popover input[name="name"]').length).toBe(1);
      expect(el.find('div#add-option-popover input[name="value"]').length).toBe(1);
      expect(el.find('div#add-option-popover .btn').length).toBe(1);
    });

    it('does not hide popover if create clicked with invalid input', async() => {
      const el = mount(
        <AddOptionButton onAdd={() => {}}/>
      );

      el.find('button#add-option-button').simulate('click');
      el.find('div#add-option-popover .btn').simulate('click');
      await act(async () => {
        el.update();
      });
      expect(el.find('div#add-option-popover').length).toBe(1);
    });

    it('does not add option if create clicked with invalid input', async() => {
      const spy = sinon.spy();
      const el = mount(
        <AddOptionButton onAdd={spy}/>
      );

      el.find('button#add-option-button').simulate('click');
      el.find('div#add-option-popover .btn').simulate('click');
      await act(async () => {
        el.update();
      });
      sinon.assert.notCalled(spy);
    });

    it('adds option when create clicked with valid input', async() => {
      const spy = sinon.spy();
      const el = mount(
        <AddOptionButton onAdd={spy}/>
      );

      el.find('button#add-option-button').simulate('click');
      el.find('div#add-option-popover input[name="section"]').simulate('change', { target: { value: 'test_section' } });
      el.find('div#add-option-popover input[name="name"]').simulate('change', { target: { value: 'test_option' } });
      el.find('div#add-option-popover input[name="value"]').simulate('change', { target: { value: 'test_value' } });
      el.find('div#add-option-popover .btn').simulate('click');
      await act(async () => {
        el.update();
      });
      sinon.assert.calledWithMatch(spy, {
        sectionName: 'test_section',
        optionName: 'test_option',
        value: 'test_value'
      });
    });
  });
});
