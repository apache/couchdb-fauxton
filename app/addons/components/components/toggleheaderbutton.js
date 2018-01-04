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

export class ToggleHeaderButton extends React.Component {
  static defaultProps = {
    innerClasses: '',
    fonticon: '',
    containerClasses: '',
    selected: false,
    title: '',
    disabled: false,
    toggleCallback: null,
    text: '',
    iconDefaultClass: 'icon'
  };

  render() {
    const { iconDefaultClass, fonticon, innerClasses, selected, containerClasses, title, disabled, text, toggleCallback, active } = this.props;
    const selectedBtnClass = (selected || active) ? 'js-headerbar-togglebutton-selected' : '';

    return (
      <button
        title={title}
        disabled={disabled}
        onClick={toggleCallback}
        className={`button ${containerClasses} ${selectedBtnClass}`}
      >
        <i className={`${iconDefaultClass} ${fonticon} ${innerClasses}`}></i><span>{text}</span>
      </button>
    );
  }
}
