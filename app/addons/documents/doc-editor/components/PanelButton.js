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
import { Button } from 'react-bootstrap';

export default class PanelButton extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
    disabled: PropTypes.bool
  };

  static defaultProps = {
    title: '',
    iconClass: '',
    onClick: () => { },
    className: '',
    disabled: false
  };

  render() {
    return (
      <div className="panel-section">
        <Button variant='cf-secondary'
          onClick={this.props.onClick}
          title={this.props.title}
          className={this.props.className}
          disabled={this.props.disabled} >
          <i className={this.props.iconClass}></i>
          <span>{this.props.title}</span>
        </Button>
      </div>
    );
  }
}
