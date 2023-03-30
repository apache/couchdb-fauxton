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

export class ConfirmButton extends React.Component {
  static propTypes = {
    showIcon: PropTypes.bool,
    id: PropTypes.string,
    customIcon: PropTypes.string,
    style: PropTypes.object,
    variant: PropTypes.oneOf([
      'primary',
      'secondary',
      'danger',
    ]),
    'data-id': PropTypes.string,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
  };

  static defaultProps = {
    disabled: false,
    showIcon: true,
    customIcon: 'fonticon-ok-circled',
    variant: 'primary',
    style: {},
    'data-id': null,
    onClick() {},
  };

  getIcon = () => {
    if (!this.props.showIcon) {
      return null;
    }
    return <i className={'icon ' + this.props.customIcon} />;
  };

  render() {
    const { onClick, variant, id, text, disabled, style } = this.props;
    return (
      <Button
        onClick={onClick}
        type="submit"
        style={style}
        disabled={disabled}
        variant={'cf-' + variant}
        data-id={this.props['data-id']}
        id={id}
      >
        {this.getIcon()}
        {text}
      </Button>
    );
  }
}
