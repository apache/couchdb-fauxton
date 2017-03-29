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

import React from "react";
import ReactDOM from "react-dom";

export const ConfirmButton = React.createClass({
  propTypes: {
    showIcon: React.PropTypes.bool,
    id: React.PropTypes.string,
    customIcon: React.PropTypes.string,
    style: React.PropTypes.object,
    buttonType: React.PropTypes.string,
    'data-id': React.PropTypes.string,
    onClick: React.PropTypes.func,
    disabled: React.PropTypes.bool,
  },

  getDefaultProps () {
    return {
      disabled: false,
      showIcon: true,
      customIcon: 'fonticon-ok-circled',
      buttonType: 'btn-primary',
      style: {},
      'data-id': null,
      onClick () { }
    };
  },

  getIcon () {
    if (!this.props.showIcon) {
      return null;
    }
    return (
      <i className={"icon " + this.props.customIcon} />
    );
  },

  render () {
    const { onClick, buttonType, id, style, text, disabled } = this.props;
    return (
      <button
        onClick={onClick}
        type="submit"
        disabled={disabled}
        data-id={this.props['data-id']}
        className={'btn save ' + buttonType}
        id={id}
        style={style}
      >
        {this.getIcon()}
        {text}
      </button>
    );
  }
});
