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

import PropTypes from 'prop-types';
import React from 'react';

export default class ConfigOptionValue extends React.Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    editing: PropTypes.bool.isRequired,
    onEdit: PropTypes.func.isRequired,
    onCancelEdit: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
  };

  state = {
    value: this.props.value
  };

  onChange = (event) => {
    this.setState({ value: event.target.value });
  };

  onSave = () => {
    if (this.state.value !== this.props.value) {
      this.props.onSave(this.state.value);
    } else {
      this.props.onCancelEdit();
    }
  };

  getButtons = () => {
    if (this.props.saving) {
      return null;
    }
    return (
      <span>
        <button
          className="btn btn-primary fonticon-ok-circled btn-small btn-config-save"
          onClick={this.onSave.bind(this)}
        />
        <button
          className="btn fonticon-cancel-circled btn-small btn-config-cancel"
          onClick={this.props.onCancelEdit}
        />
      </span>
    );

  };

  render() {
    if (this.props.editing) {
      return (
        <td>
          <div className="config-value-form">
            <input
              onChange={this.onChange.bind(this)}
              defaultValue={this.props.value}
              disabled={this.props.saving}
              autoFocus type="text" className="config-value-input"
            />
            {this.getButtons()}
          </div>
        </td>
      );
    }
    return (
      <td className="config-show-value" onClick={this.props.onEdit}>
        {this.props.value}
      </td>
    );

  }
}
