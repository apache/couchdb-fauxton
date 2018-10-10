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
import Components from '../components/react-components';
import ConfigTable from './ConfigTable';

export class ConfigTableScreen extends React.Component {
  static propTypes = {
    options: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    saveOption: PropTypes.func.isRequired,
    deleteOption: PropTypes.func.isRequired,
    editOption: PropTypes.func.isRequired,
    cancelEdit: PropTypes.func.isRequired
  };

  saveOption = (option) => {
    this.props.saveOption(this.props.node, option);
  };

  deleteOption = (option) => {
    this.props.deleteOption(this.props.node, option);
  };

  editOption = (option) => {
    this.props.editOption(option);
  };

  cancelEdit = () => {
    this.props.cancelEdit();
  };

  render() {
    if (this.props.loading) {
      return (
        <div className="view">
          <Components.LoadLines />
        </div>
      );
    }
    return (
      <ConfigTable
        onDeleteOption={this.deleteOption}
        onSaveOption={this.saveOption}
        onEditOption={this.editOption}
        onCancelEdit={this.cancelEdit}
        options={this.props.options}/>
    );
  }
}
