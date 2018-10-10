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
import ConfigOptionValue from './ConfigOptionValue';
import ConfigOptionTrash from './ConfigOptionTrash';

export default class ConfigOption extends React.Component {
  static propTypes = {
    option: PropTypes.object.isRequired,
    saving: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onCancelEdit: PropTypes.func.isRequired
  };

  onSave = (value) => {
    const option = this.props.option;
    option.value = value;
    this.props.onSave(option);
  };

  onDelete = () => {
    this.props.onDelete(this.props.option);
  };

  onEdit = () => {
    this.props.onEdit(this.props.option);
  };

  render() {
    return (
      <tr className="config-item">
        <th>{this.props.option.header && this.props.option.sectionName}</th>
        <td>{this.props.option.optionName}</td>
        <ConfigOptionValue
          value={this.props.option.value}
          editing={this.props.option.editing}
          saving={this.props.saving}
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
}
