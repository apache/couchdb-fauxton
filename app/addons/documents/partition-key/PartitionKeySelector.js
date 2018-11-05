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

import PropTypes from 'prop-types';
import React from 'react';

export default class PartitionKeySelector extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      editorValue: '',
      editMode: false
    };
    this.onModeSwitchClick = this.onModeSwitchClick.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.startEdit = this.startEdit.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onChange = this.onChange.bind(this);
    this.props.checkDbPartitioned(this.props.databaseName);
  }

  onModeSwitchClick(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (!this.props.globalMode && this.props.onGlobalModeSelected) {
      this.props.onGlobalModeSelected();
    } else if (this.props.partitionKey) {
      this.props.onPartitionKeySelected(this.state.editorValue);
    } else {
      this.startEdit();
    }
  }

  startEdit() {
    this.setState({editMode: true, editorValue: this.props.partitionKey});
    setTimeout(() => this.textInput.focus());
  }

  updatePartitionKey() {
    this.setState({editMode: false});
    const trimmedValue = this.state.editorValue.trim();
    if (trimmedValue) {
      this.props.onPartitionKeySelected(trimmedValue);
    } else {
      this.props.onGlobalModeSelected();
    }
  }

  onBlur(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    this.updatePartitionKey();
  }

  onKeyPress(e) {
    if (e.key === 'Enter') {
      this.updatePartitionKey();
    }
  }

  onChange(e) {
    this.setState({editorValue: e.target.value});
  }

  globalHeader() {
    return (
      <button onClick={this.onModeSwitchClick} title="Partition Key Selector" className="button partition-selector__switch">
        <i className="fonticon-filter"></i>
        No partition selected
      </button>
    );
  }

  partitionHeader() {
    const editor = (
      <input type="text"
        style={{padding:2, fontSize:16, margin: 0, display: this.state.editMode ? 'block' : 'none'}}
        onKeyPress={this.onKeyPress}
        onChange={this.onChange}
        onBlur={this.onBlur}
        value={this.state.editorValue}
        ref={(input) => { this.textInput = input; }} />
    );
    let partName = 'Click to select a partition';
    let className = 'partition-selector__key';
    if (this.props.partitionKey !== '') {
      partName = this.props.partitionKey;
      className += ' partition-selector__key--active';
    }
    return (
      <React.Fragment>
        <button onClick={this.onModeSwitchClick} title="Partition Key Selector" className="button partition-selector__switch button partition-selector__switch--active">
          <i className="fonticon-filter"></i>
        </button>
        <div className={className}>
          <span onClick={this.startEdit} style={{display: this.state.editMode ? 'none' : 'block'}}>{partName}</span>
          {editor}
        </div>
      </React.Fragment>
    );
  }

  render() {
    if (!this.props.selectorVisible) {
      return null;
    }
    const global = this.props.globalMode && !this.state.editMode;
    return (
      <div className="partition-selector" >
        {global ? this.globalHeader() : this.partitionHeader()}
      </div>
    );
  }
}

PartitionKeySelector.defaultProps = {
  partitionKey: '',
  globalMode: true
};

PartitionKeySelector.propTypes = {
  selectorVisible: PropTypes.bool.isRequired,
  partitionKey: PropTypes.string.isRequired,
  checkDbPartitioned: PropTypes.func.isRequired,
  onPartitionKeySelected: PropTypes.func.isRequired,
  onGlobalModeSelected: PropTypes.func,
  globalMode: PropTypes.bool
};
