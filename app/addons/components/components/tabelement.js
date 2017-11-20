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

import React from "react";
import ReactDOM from "react-dom";

export const TabElement = ({selected, text, onChange, iconClass, badgeText}) => {

  const additionalClass = selected ? 'tab-element-checked' : '';
  let badge = null;
  if (badgeText) {
    badge = <span className="tab-element-badge">{badgeText}</span>;
  }
  return (
    <li className={`component-tab-element ${additionalClass}`}>

      <label>
        <div className="tab-element-indicator-wrapper">
          <div className="tab-element-indicator"></div>
        </div>
        <div className="tab-element-content">
          <i className={iconClass}></i>
          <input
            type="radio"
            value={text}
            checked={selected}
            onChange={onChange} />

          {text}
          {badge}
        </div>
      </label>
    </li>

  );
};
TabElement.propTypes = {
  selected: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  iconClass: PropTypes.string,
  badgeText: PropTypes.string
};

export const TabElementWrapper = ({children}) => {
  return (
    <ul className="component-tab-element-wrapper">
      {children}
    </ul>
  );
};
