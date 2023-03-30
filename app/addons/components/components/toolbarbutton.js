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

export class ToolbarButton extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    icon: PropTypes.string,
    style: PropTypes.object,
    'data-id': PropTypes.string,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
  };

  static defaultProps = {
    disabled: false,
    style: {},
    'data-id': null,
    onClick: () => {},
  };

  getIcon = () => {
    if (!this.props.icon) {
      return null;
    }
    return <i className={'fonticon ' + this.props.icon} />;
  };

  render() {
    const { onClick, id, children, disabled, ...otherProps } = this.props;
    return (
      <button
        onClick={onClick}
        type="button"
        disabled={disabled}
        className="toolbar-btn"
        data-id={this.props['data-id']}
        id={id}
        {...otherProps}
      >
        {this.getIcon()}
        {children}
      </button>
    );
  }
}
