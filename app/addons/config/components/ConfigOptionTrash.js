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
import FauxtonComponents from '../../fauxton/components';

export default class ConfigOptionTrash extends React.Component {
  constructor (props) {
    super(props);
    this.onDelete = this.onDelete.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.state = { show: false };
  }

  static propTypes = {
    sectionName: PropTypes.string.isRequired,
    optionName: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired
  };

  onDelete = () => {
    this.props.onDelete();
  };

  showModal = () => {
    this.setState({ show: true });
  };

  hideModal = () => {
    this.setState({ show: false });
  };

  render() {
    return (
      <td className="text-center config-item-trash config-delete-value">
        <i className="icon icon-trash" onClick={this.showModal}></i>
        <FauxtonComponents.ConfirmationModal
          text={`Are you sure you want to delete ${this.props.sectionName}/${this.props.optionName}?`}
          onClose={this.hideModal}
          onSubmit={this.onDelete}
          visible={this.state.show}/>
      </td>
    );
  }
}
