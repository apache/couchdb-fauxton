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
import Views from "../components.react";
import Actions from "../actions";
import Stores from "../stores";
import utils from "../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import TestUtils from "react-addons-test-utils";
import sinon from "sinon";

FauxtonAPI.router = new FauxtonAPI.Router([]);
var assert = utils.assert;
var configStore = Stores.configStore;

describe('Config Components', function () {
  describe('ConfigTableController', function () {
    var container, elm, node;

    beforeEach(function () {
      container = document.createElement('div');
      configStore._loading = false;
      configStore._sections = {};
      node = 'node2@127.0.0.1';
      elm = TestUtils.renderIntoDocument(
        <Views.ConfigTableController node={node}/>,
        container
      );
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('deletes options', function () {
      var spy = sinon.stub(Actions, 'deleteOption');
      var option = {};

      elm.deleteOption(option);
      assert.ok(spy.calledWith(node, option));
    });

    it('saves options', function () {
      var spy = sinon.stub(Actions, 'saveOption');
      var option = {};

      elm.saveOption(option);
      assert.ok(spy.calledWith(node, option));
    });

    it('edits options', function () {
      var spy = sinon.stub(Actions, 'editOption');
      var option = {};

      elm.editOption(option);
      assert.ok(spy.calledWith(option));
    });

    it('cancels editing', function () {
      var spy = sinon.stub(Actions, 'cancelEdit');

      elm.cancelEdit();
      assert.ok(spy.calledOnce);
    });
  });

  describe('ConfigTable', function () {
    var container, elm;
    var onSaveOptionSpy = sinon.spy();
    var onDeleteOptionSpy = sinon.spy();
    var onCancelEditSpy = sinon.spy();
    var onEditOptionSpy = sinon.spy();

    beforeEach(function () {
      container = document.createElement('div');
      elm = TestUtils.renderIntoDocument(
        (<Views.ConfigTable
          onDeleteOption={onDeleteOptionSpy}
          onSaveOption={onSaveOptionSpy}
          onEditOption={onEditOptionSpy}
          onCancelEdit={onCancelEditSpy}
          options={[]}
        />),
        container
      );
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('calls onEditOption prop with option on edit', function () {
      var option = {};

      elm.onEditOption(option);
      assert.ok(onEditOptionSpy.calledWith(option));
    });

    it('calls onSaveOption prop with option on save', function () {
      var option = {};

      elm.onSaveOption(option);
      assert.ok(onSaveOptionSpy.calledWith(option));
    });

    it('calls onDeleteOption prop with option on delete', function () {
      var option = {};

      elm.onDeleteOption(option);
      assert.ok(onDeleteOptionSpy.calledWith(option));
    });

    it('calls onCancelEdit prop on cancel', function () {
      elm.onCancelEdit();
      assert.ok(onCancelEditSpy.called);
    });
  });

  describe('ConfigOption', function () {
    var container, elm, option;
    var onSaveSpy = sinon.spy();
    var onEditSpy = sinon.spy();
    var onCancelEditSpy = sinon.spy();
    var onDeleteSpy = sinon.spy();

    beforeEach(function () {
      container = document.createElement('div');
      option = {
        sectionName: 'test_section',
        optionName: 'test_option',
        value: 'test_value'
      };
      elm = TestUtils.renderIntoDocument(
        (<Views.ConfigOption
          onDelete={onDeleteSpy}
          onSave={onSaveSpy}
          onEdit={onEditSpy}
          onCancelEdit={onCancelEditSpy}
          option={option}
        />),
        container
      );
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('calls onEdit prop with option prop on edit', function () {
      var option = {
        sectionName: 'test_section',
        optionName: 'test_option',
        value: 'test_value'
      };

      elm.onEdit();
      assert.ok(onEditSpy.calledWith(sinon.match(option)));
    });

    it('calls onSaveOption prop with new option value on save', function () {
      var option = {
        sectionName: 'test_section',
        optionName: 'test_option',
        value: 'test_new_value'
      };

      elm.onSave('test_new_value');
      assert.ok(onSaveSpy.calledWith(sinon.match(option)));
    });

    it('calls onDeleteOption prop with option on delete', function () {
      var option = {
        sectionName: 'test_section',
        optionName: 'test_option',
        value: 'test_value'
      };

      elm.onDelete();
      assert.ok(onDeleteSpy.calledWith(sinon.match(option)));
    });

    it('calls onCancelEdit prop on cancel', function () {
      elm.onCancelEdit();
      assert.ok(onCancelEditSpy.called);
    });
  });

  describe('ConfigOption render', function () {
    var container;

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('renders section name if the option is a header', function () {
      var option = {
        sectionName: 'test_section',
        optionName: 'test_option',
        value: 'test_value',
        header: true
      };

      var el = TestUtils.renderIntoDocument(<Views.ConfigOption option={option}/>, container);
      assert.equal($(ReactDOM.findDOMNode(el)).find('th').text(), 'test_section');
    });
  });

  describe('ConfigOptionValue', function () {
    var container, elm;
    var onSaveSpy = sinon.spy();
    var onEditSpy = sinon.spy();
    var onCancelEditSpy = sinon.spy();

    beforeEach(function () {
      container = document.createElement('div');
      elm = TestUtils.renderIntoDocument(
        (<Views.ConfigOptionValue
          onSave={onSaveSpy}
          onEdit={onEditSpy}
          onCancelEdit={onCancelEditSpy}
          value={'test_value'}
        />),
        container
      );
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
      onCancelEditSpy.reset();
    });

    it('calls onSave prop if saved with a new value', function () {
      elm.onSave('new');
      assert.ok(onSaveSpy.calledWith('new'));
    });

    it('calls onCancelEdit prop if saved with unchanged value', function () {
      elm.onSave('test_value');
      assert.ok(onCancelEditSpy.calledOnce);
    });

    it('calls onEdit prop on edit', function () {
      elm.onEdit();
      assert.ok(onEditSpy.calledOnce);
    });

    it('calls onCancelEdit prop on edit cancel', function () {
      elm.onCancelEdit();
      assert.ok(onCancelEditSpy.calledOnce);
    });
  });

  describe('ConfigOptionValue render', function () {
    var container;

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('displays the value prop', function () {
      var el = TestUtils.renderIntoDocument(
        <Views.ConfigOptionValue value={'test_value'}/>, container
      );

      assert.equal($(ReactDOM.findDOMNode(el)).text(), 'test_value');
    });

    it('starts editing when clicked', function () {
      var spy = sinon.spy();
      var el = TestUtils.renderIntoDocument(
        <Views.ConfigOptionValue value={'test_value'} onEdit={spy}/>, container
      );

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el))[0]);
      assert.ok(spy.calledOnce);
    });

    it('displays editing controls if editing', function () {
      var el = TestUtils.renderIntoDocument(
        <Views.ConfigOptionValue value={'test_value'} editing/>, container
      );

      assert.equal($(ReactDOM.findDOMNode(el)).find('input.config-value-input').length, 1);
      assert.equal($(ReactDOM.findDOMNode(el)).find('button.btn-config-cancel').length, 1);
      assert.equal($(ReactDOM.findDOMNode(el)).find('button.btn-config-save').length, 1);
    });

    it('disables input when save clicked', function () {
      var el = TestUtils.renderIntoDocument(
        <Views.ConfigOptionValue value={'test_value'} editing/>, container
      );

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('button.btn-config-save')[0]);
      assert.equal($(ReactDOM.findDOMNode(el)).find('input.config-value-input').attr('disabled'));
    });

    it('saves changed value of input when save clicked', function () {
      var change = { target: { value: 'new_value' } };
      var spy = sinon.spy();
      var el = TestUtils.renderIntoDocument(
        <Views.ConfigOptionValue value={'test_value'} editing onSave={spy}/>, container
      );

      TestUtils.Simulate.change($(ReactDOM.findDOMNode(el)).find('input.config-value-input')[0], change);
      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('button.btn-config-save')[0]);
      assert.ok(spy.calledWith('new_value'));
    });

    it('cancels edit if save clicked with unchanged value', function () {
      var spy = sinon.spy();
      var el = TestUtils.renderIntoDocument(
        <Views.ConfigOptionValue value={'test_value'} editing onCancelEdit={spy}/>, container
      );

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('button.btn-config-save')[0]);
      assert.ok(spy.calledOnce);
    });
  });

  describe('ConfigOptionTrash', function () {
    var container, elm;
    var onDeleteSpy = sinon.spy();

    beforeEach(function () {
      container = document.createElement('div');
      elm = TestUtils.renderIntoDocument(
        (<Views.ConfigOptionTrash
          onDelete={onDeleteSpy}
        />),
        container
      );
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('calls onDelete prop on delete', function () {
      elm.onDelete();
      assert.ok(onDeleteSpy.calledOnce);
    });
  });

  describe('ConfigOptionTrash render', function () {
    var container;

    beforeEach(function () {
      container = document.createElement('div');
      _.each($('div[data-reactroot]'), function (el) {
        ReactDOM.unmountComponentAtNode(el.parentNode);
      });
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('displays delete modal when clicked', function () {
      var el = TestUtils.renderIntoDocument(
        <Views.ConfigOptionTrash sectionName='test_section' optionName='test_option'/>, container
      );

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el))[0]);
      assert.equal($('div.confirmation-modal').length, 1);
    });

    it('calls on delete when confirmation modal Okay button clicked', function () {
      var spy = sinon.spy();
      var el = TestUtils.renderIntoDocument(
        <Views.ConfigOptionTrash onDelete={spy}/>, container
      );

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el))[0]);
      TestUtils.Simulate.click($('div.confirmation-modal button.btn-success')[0]);
      assert.ok(spy.calledOnce);
    });
  });

  describe('AddOptionController', function () {
    var container, elm;

    beforeEach(function () {
      container = document.createElement('div');
      elm = TestUtils.renderIntoDocument(
        <Views.AddOptionController node='node2@127.0.0.1'/>,
        container
      );
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('adds options', function () {
      var spy = sinon.stub(Actions, 'addOption');

      elm.addOption();
      assert.ok(spy.calledOnce);
    });
  });

  describe('AddOptionButton', function () {
    var container, elm;
    var onAddSpy = sinon.spy();

    beforeEach(function () {
      container = document.createElement('div');
      elm = TestUtils.renderIntoDocument(
        <Views.AddOptionButton onAdd={onAddSpy}/>,
        container
      );
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
      elm.reset();
    });

    it('isInputValid returns false if section name empty', function () {
      elm.updateOptionName('test_option');
      elm.updateValue('test_value');

      assert.isFalse(elm.isInputValid());
    });

    it('isInputValid returns false if option name empty', function () {
      elm.updateOptionName('test_section');
      elm.updateValue('test_value');

      assert.isFalse(elm.isInputValid());
    });

    it('isInputValid returns false if value empty', function () {
      elm.updateOptionName('test_section');
      elm.updateValue('test_option');

      assert.isFalse(elm.isInputValid());
    });

    it('calls onAdd prop on add with valid input', function () {
      elm.updateSectionName('test_section');
      elm.updateOptionName('test_option');
      elm.updateValue('test_value');

      elm.onAdd();
      assert.ok(onAddSpy.calledWith(sinon.match({
        sectionName: 'test_section',
        optionName: 'test_option',
        value: 'test_value'
      })));
    });
  });

  describe('AddOptionButton render', function () {
    var container;

    beforeEach(function () {
      container = document.createElement('div');
      _.each($('div[data-reactroot]'), function (el) {
        ReactDOM.unmountComponentAtNode(el.parentNode);
      });
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('displays add option controls when clicked', function () {
      var el = TestUtils.renderIntoDocument(
        <Views.AddOptionButton/>, container
      );

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('button#add-option-button')[0]);
      assert.equal($('div#add-option-popover .input-section-name').length, 1);
      assert.equal($('div#add-option-popover .input-option-name').length, 1);
      assert.equal($('div#add-option-popover .input-value').length, 1);
      assert.equal($('div#add-option-popover .btn-create').length, 1);
    });

    it('does not hide popover if create clicked with invalid input', function () {
      var el = TestUtils.renderIntoDocument(
        <Views.AddOptionButton/>, container
      );

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('button#add-option-button')[0]);
      TestUtils.Simulate.click($('div#add-option-popover .btn-create')[0]);
      assert.equal($('div#add-option-popover').length, 1);
    });

    it('does not add option if create clicked with invalid input', function () {
      var el = TestUtils.renderIntoDocument(
        <Views.AddOptionButton/>, container
      );

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('button#add-option-button')[0]);
      TestUtils.Simulate.click($('div#add-option-popover .btn-create')[0]);
      assert.equal($('div#add-option-popover').length, 1);
    });


    it('does adds option if create clicked with valid input', function () {
      var el = TestUtils.renderIntoDocument(
        <Views.AddOptionButton/>, container
      );

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('button#add-option-button')[0]);
      TestUtils.Simulate.click($('div#add-option-popover .btn-create')[0]);
      assert.equal($('div#add-option-popover').length, 1);
    });

    it('adds option when create clicked with valid input', function () {
      var spy = sinon.spy();
      var el = TestUtils.renderIntoDocument(
        <Views.AddOptionButton onAdd={spy}/>, container
      );

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('button#add-option-button')[0]);
      TestUtils.Simulate.change($('div#add-option-popover .input-section-name')[0], { target: { value: 'test_section' } });
      TestUtils.Simulate.change($('div#add-option-popover .input-option-name')[0], { target: { value: 'test_option' } });
      TestUtils.Simulate.change($('div#add-option-popover .input-value')[0], { target: { value: 'test_value' } });
      TestUtils.Simulate.click($('div#add-option-popover .btn-create')[0]);
      assert.ok(spy.calledWith(sinon.match({
        sectionName: 'test_section',
        optionName: 'test_option',
        value: 'test_value'
      })));
    });
  });
});
