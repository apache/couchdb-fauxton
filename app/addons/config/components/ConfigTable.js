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
import ConfigOption from './ConfigOption';

export default class ConfigTable extends React.Component {
  static propTypes = {
    options: PropTypes.arrayOf(PropTypes.shape({
      editing: PropTypes.bool.isRequired,
      header: PropTypes.bool,
      optionName: PropTypes.string.isRequired,
      sectionName: PropTypes.string.isRequired,
      value: PropTypes.string
    })).isRequired,
    saving: PropTypes.bool.isRequired,
    onDeleteOption: PropTypes.func.isRequired,
    onEditOption: PropTypes.func.isRequired,
    onSaveOption: PropTypes.func.isRequired,
    onCancelEdit: PropTypes.func.isRequired
  };

  createOptions = () => {
    return _.map(this.props.options, (option) => (
      <ConfigOption
        option={option}
        saving={this.props.saving}
        onDelete={this.props.onDeleteOption}
        onSave={this.props.onSaveOption}
        onEdit={this.props.onEditOption}
        onCancelEdit={this.props.onCancelEdit}
        key={`${option.sectionName}/${option.optionName}`}
      />
    ));
  };

  render() {
    const options = this.createOptions();

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
}
