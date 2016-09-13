//  Licensed under the Apache License, Version 2.0 (the "License"); you may not
//  use this file except in compliance with the License. You may obtain a copy of
//  the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
//  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
//  License for the specific language governing permissions and limitations under
//  the License.

import React from "react";
import ReactDOM from "react-dom";
import Stores from "./stores";
import Actions from "./actions";
import {Overlay, Button, Popover} from "react-bootstrap";
import Components from "../components/react-components.react";
import FauxtonComponents from "../fauxton/components.react";

const configStore = Stores.configStore;

var ConfigTableController = React.createClass({
  getStoreState () {
    return {
      options: configStore.getOptions(),
      loading: configStore.isLoading()
    };
  },

  getInitialState () {
    return this.getStoreState();
  },

  componentDidMount () {
    configStore.on('change', this.onChange, this);
  },

  componentWillUnmount () {
    configStore.off('change', this.onChange);
  },

  onChange () {
    if (this.isMounted()) {
      this.setState(this.getStoreState());
    }
  },

  saveOption (option) {
    Actions.saveOption(this.props.node, option);
  },

  deleteOption (option) {
    Actions.deleteOption(this.props.node, option);
  },

  editOption (option) {
    Actions.editOption(option);
  },

  cancelEdit () {
    Actions.cancelEdit();
  },

  render () {
    if (this.state.loading) {
      return (
        <div className="view">
          <Components.LoadLines />
        </div>
      );
    } else {
      return (
        <ConfigTable
          onDeleteOption={this.deleteOption}
          onSaveOption={this.saveOption}
          onEditOption={this.editOption}
          onCancelEdit={this.cancelEdit}
          options={this.state.options}/>
      );
    }
  }
});

var ConfigTable = React.createClass({
  createOptions () {
    return _.map(this.props.options, (option) => (
      <ConfigOption
        option={option}
        onDelete={this.props.onDeleteOption}
        onSave={this.props.onSaveOption}
        onEdit={this.props.onEditOption}
        onCancelEdit={this.props.onCancelEdit}
        key={`${option.sectionName}/${option.optionName}`}
      />
    ));
  },

  render () {
    var options = this.createOptions();

    return (
      <table className="config table table-striped table-bordered">
        <thead>
        <tr>
          <th id="config-section" width="22%">Section</th>
          <th id="config-option" width="22%">Option</th>
          <th id="config-value">Value</th>
          <th id="config-trash"></th>
        </tr>
        </thead>
        <tbody>
        {options}
        </tbody>
      </table>
    );
  }
});

var ConfigOption = React.createClass({
  onSave (value) {
    var option = this.props.option;
    option.value = value;
    this.props.onSave(option);
  },

  onDelete () {
    this.props.onDelete(this.props.option);
  },

  onEdit () {
    this.props.onEdit(this.props.option);
  },

  render () {
    return (
      <tr className="config-item">
        <th>{this.props.option.header && this.props.option.sectionName}</th>
        <td>{this.props.option.optionName}</td>
        <ConfigOptionValue
          value={this.props.option.value}
          editing={this.props.option.editing}
          onSave={this.onSave}
          onEdit={this.onEdit}
          onCancelEdit={this.props.onCancelEdit}
        />
        <ConfigOptionTrash
          optionName={this.props.option.optionName}
          sectionName={this.props.option.sectionName}
          onDelete={this.onDelete}/>
      </tr>
    );
  }
});

var ConfigOptionValue = React.createClass({
  getInitialState () {
    return {
      value: this.props.value,
      editing: this.props.editing,
      saving: this.props.saving
    };
  },

  getDefaultProps () {
    return {
      value: '',
      editing: false,
      saving: false,
      onSave: () => null,
      onEdit: () => null,
      onCancelEdit: () => null
    };
  },

  componentWillReceiveProps (nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState({ saving: false });
    }
  },

  onChange (event) {
    this.setState({ value: event.target.value });
  },

  onSave () {
    if (this.state.value !== this.props.value) {
      this.setState({ saving: true });
      this.props.onSave(this.state.value);
    } else {
      this.props.onCancelEdit();
    }
  },

  getButtons () {
    if (this.state.saving) {
      return null;
    } else {
      return (
        <span>
          <button
            className="btn btn-success fonticon-ok-circled btn-small btn-config-save"
            onClick={this.onSave}
          />
          <button
            className="btn fonticon-cancel-circled btn-small btn-config-cancel"
            onClick={this.props.onCancelEdit}
          />
        </span>
      );
    }
  },

  render () {
    if (this.props.editing) {
      return (
        <td>
          <div className="config-value-form">
            <input
              onChange={this.onChange}
              defaultValue={this.props.value}
              disabled={this.state.saving}
              autoFocus type="text" className="config-value-input"
            />
            {this.getButtons()}
          </div>
        </td>
      );
    } else {
      return (
        <td className="config-show-value" onClick={this.props.onEdit}>
          {this.props.value}
        </td>
      );
    }
  }
});

var ConfigOptionTrash = React.createClass({
  getInitialState () {
    return {
      show: false
    };
  },

  onDelete () {
    this.props.onDelete();
  },

  showModal () {
    this.setState({ show: true });
  },

  hideModal () {
    this.setState({ hide: false });
  },

  render () {
    return (
      <td className="text-center config-item-trash config-delete-value"
          onClick={this.showModal}>
        <i className="icon icon-trash"></i>
        <FauxtonComponents.ConfirmationModal
          text={`Are you sure you want to delete ${this.props.sectionName}/${this.props.optionName}?`}
          onClose={this.hideModal}
          onSubmit={this.onDelete}
          visible={this.state.show}/>
      </td>
    );
  }
});

var AddOptionController = React.createClass({
  addOption (option) {
    Actions.addOption(this.props.node, option);
  },

  render () {
    return (
      <AddOptionButton onAdd={this.addOption}/>
    );
  }
});

var AddOptionButton = React.createClass({
  getInitialState () {
    return {
      sectionName: '',
      optionName: '',
      value: '',
      show: false
    };
  },

  isInputValid () {
    if (this.state.sectionName !== ''
      && this.state.optionName !== ''
      && this.state.value !== '') {
      return true;
    }

    return false;
  },

  updateSectionName (event) {
    this.setState({ sectionName: event.target.value });
  },

  updateOptionName (event) {
    this.setState({ optionName: event.target.value });
  },

  updateValue (event) {
    this.setState({ value: event.target.value });
  },

  reset () {
    this.setState(this.getInitialState());
  },

  onAdd () {
    if (this.isInputValid()) {
      var option = {
        sectionName: this.state.sectionName,
        optionName: this.state.optionName,
        value: this.state.value
      };

      this.setState({ show: false });
      this.props.onAdd(option);
    }
  },

  togglePopover () {
    this.setState({ show: !this.state.show });
  },

  hidePopover () {
    this.setState({ show: false });
  },

  getPopover () {
    return (
      <Popover className="tray" id="add-option-popover" title="Add Option">
        <input
          className="input-section-name"
          onChange={this.updateSectionName}
          type="text" name="section" placeholder="Section" autocomplete="off" autoFocus/>
        <input
          className="input-option-name"
          onChange={this.updateOptionName}
          type="text" name="name" placeholder="Name"/>
        <input
          className="input-value"
          onChange={this.updateValue}
          type="text" name="value" placeholder="Value"/>
        <a
          className="btn btn-create"
          onClick={this.onAdd}>
          Create
        </a>
      </Popover>
    );
  },

  render () {
    return (
      <div id="add-option-panel">
        <Button
          id="add-option-button"
          onClick={this.togglePopover}
          ref="target">
          <i className="icon icon-plus header-icon"></i>
          Add Option
        </Button>

        <Overlay
          show={this.state.show}
          onHide={this.hidePopover}
          placement="bottom"
          rootClose={true}
          target={() => ReactDOM.findDOMNode(this.refs.target)}>
          {this.getPopover()}
        </Overlay>
      </div>
    );
  }
});

export default {
  ConfigTableController: ConfigTableController,
  ConfigTable: ConfigTable,
  ConfigOption: ConfigOption,
  ConfigOptionValue: ConfigOptionValue,
  ConfigOptionTrash: ConfigOptionTrash,
  AddOptionController: AddOptionController,
  AddOptionButton: AddOptionButton
};
