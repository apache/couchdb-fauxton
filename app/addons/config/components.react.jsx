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
//

import React from "react";
import ReactDOM from "react-dom";
import Stores from "./stores";
import Actions from "./actions";
import {Overlay, Button, Popover} from "react-bootstrap";
import Components from "../components/react-components.react";
import FauxtonComponents from "../fauxton/components.react";

var configStore = Stores.configStore;

var ConfigTableController = React.createClass({
  getStoreState: function () {
    return {
      options: configStore.getOptions(),
      loading: configStore.isLoading()
    };
  },

  getInitialState: function () {
    return this.getStoreState();
  },

  componentDidMount: function () {
    configStore.on('change', this.onChange, this);
  },

  componentWillUnmount: function () {
    configStore.off('change', this.onChange, this);
  },

  onChange: function () {
    if (this.isMounted()) {
      this.setState(this.getStoreState());
    }
  },

  saveOption: function (option) {
    Actions.saveOption(this.props.node, option);
  },

  deleteOption: function (option) {
    Actions.deleteOption(this.props.node, option);
  },

  editOption: function (option) {
    Actions.editOption(option);
  },

  cancelEdit: function () {
    Actions.cancelEdit();
  },

  render: function () {
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
  onSaveOption: function (option) {
    this.props.onSaveOption(option);
  },

  onEditOption: function (option) {
    this.props.onEditOption(option);
  },

  onDeleteOption: function (option) {
    this.props.onDeleteOption(option);
  },

  onCancelEdit: function () {
    this.props.onCancelEdit();
  },

  createOptions: function () {
    return _.map(this.props.options, function (option) {
      return <ConfigOption
        option={option}
        onDelete={this.onDeleteOption}
        onSave={this.onSaveOption}
        onEdit={this.onEditOption}
        onCancelEdit={this.onCancelEdit}
        key={`${option.sectionName}/${option.optionName}`}
      />;
    }.bind(this));
  },

  render: function () {
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
  onSave: function (value) {
    var option = this.props.option;
    option.value = value;
    this.props.onSave(option);
  },

  onDelete: function () {
    this.props.onDelete(this.props.option);
  },

  onEdit: function () {
    this.props.onEdit(this.props.option);
  },

  onCancelEdit: function () {
    this.props.onCancelEdit();
  },

  render: function () {
    return (
      <tr className="config-item">
        <th>{this.props.option.header && this.props.option.sectionName}</th>
        <td>{this.props.option.optionName}</td>
        <ConfigOptionValue
          value={this.props.option.value}
          editing={this.props.option.editing}
          onSave={this.onSave}
          onEdit={this.onEdit}
          onCancelEdit={this.onCancelEdit}
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
  getInitialState: function () {
    return {
      value: this.props.value,
      editing: this.props.editing,
      saving: this.props.saving
    };
  },

  getDefaultProps: function () {
    return {
      value: '',
      editing: false,
      saving: false,
      onSave: () => null,
      onEdit: () => null,
      onCancelEdit: () => null
    };
  },

  componentWillReceiveProps: function (nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState({ saving: false });
    }
  },

  onChange: function (value) {
    this.setState({ value });
  },

  onSave: function (value) {
    if (value !== this.props.value) {
      this.setState({ saving: true });
      this.props.onSave(value);
    } else {
      this.onCancelEdit();
    }
  },

  onEdit: function () {
    this.props.onEdit();
  },

  onCancelEdit: function () {
    this.props.onCancelEdit();
  },

  getButtons: function () {
    if (this.state.saving) {
      return null;
    } else {
      return (
        <span>
          <button
            className="btn btn-success fonticon-ok-circled btn-small btn-config-save"
            onClick={() => this.onSave(this.state.value)}
          />
          <button
            className="btn fonticon-cancel-circled btn-small btn-config-cancel"
            onClick={this.onCancelEdit}
          />
        </span>
      );
    }
  },

  render: function () {
    if (this.props.editing) {
      return (
        <td>
          <div className="config-value-form">
            <input
              onChange={(e) => this.onChange(e.target.value)}
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
        <td className="config-show-value" onClick={this.onEdit}>
          {this.props.value}
        </td>
      );
    }
  }
});

var ConfigOptionTrash = React.createClass({
  getInitialState: function () {
    return {
      showModal: false
    };
  },

  onDelete: function () {
    this.props.onDelete();
  },

  render: function () {
    return (
      <td className="text-center config-item-trash config-delete-value"
          onClick={() => this.setState({showModal: true})}>
        <i className="icon icon-trash"></i>
        <FauxtonComponents.ConfirmationModal
          text={`Are you sure you want to delete ${this.props.sectionName}/${this.props.optionName}?`}
          onClose={() => this.setState({showModal: false})}
          onSubmit={this.onDelete}
          visible={this.state.showModal}/>
      </td>
    );
  }
});

var AddOptionController = React.createClass({
  addOption: function (option) {
    Actions.addOption(this.props.node, option);
  },

  render: function () {
    return (
      <AddOptionButton onAdd={this.addOption}/>
    );
  }
});

var AddOptionButton = React.createClass({
  getInitialState: function () {
    return {
      sectionName: '',
      optionName: '',
      value: '',
      show: false
    };
  },

  isInputValid: function () {
    if (this.state.sectionName !== ''
      && this.state.optionName !== ''
      && this.state.value !== '') {
      return true;
    }

    return false;
  },

  updateSectionName: function (sectionName) {
    this.setState({ sectionName });
  },

  updateOptionName: function (optionName) {
    this.setState({ optionName });
  },

  updateValue: function (value) {
    this.setState({ value });
  },

  reset: function () {
    this.setState(this.getInitialState());
  },

  onAdd: function () {
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

  getPopover: function () {
    return (
      <Popover className="tray" id="add-option-popover" title="Add Option">
        <input
          className="input-section-name"
          onChange={e => this.updateSectionName(e.target.value)}
          type="text" name="section" placeholder="Section" autocomplete="off" autoFocus/>
        <input
          className="input-option-name"
          onChange={e => this.updateOptionName(e.target.value)}
          type="text" name="name" placeholder="Name"/>
        <input
          className="input-value"
          onChange={e => this.updateValue(e.target.value)}
          type="text" name="value" placeholder="Value"/>
        <a
          className="btn btn-create"
          onClick={this.onAdd}>
          Create
        </a>
      </Popover>
    );
  },

  render: function () {
    return (
      <div id="add-option-panel">
        <Button
          id="add-option-button"
          onClick={() => this.setState({ show: !this.state.show })}
          ref="target">
          <i className="icon icon-plus header-icon"></i>
          Add Option
        </Button>

        <Overlay
          show={this.state.show}
          onHide={() => this.setState({ show: false })}
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
