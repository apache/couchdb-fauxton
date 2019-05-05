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

import classNames from 'classnames';

const Burger = ({toggleMenu, isMinimized}) => {

  const burgerClasses = classNames(
    'faux-navbar__burger',
    {'faux-navbar--wide':  !isMinimized},
    {'faux-navbar--narrow': isMinimized}
  );

  const icon = isMinimized ?
    'icon-resize-horizontal' :
    'icon-signin faux-navbar__burger__icon--flipped';

  return (
    <div aria-expanded={!isMinimized} aria-label="Toggle Navigation Menu" className={burgerClasses} onClick={toggleMenu} role="button" tabIndex="0">
      <i aria-hidden="true" className={"faux-navbar__burger__icon " + icon}></i>
    </div>
  );
};

Burger.propTypes = {
  toggleMenu: PropTypes.func.isRequired,
  isMinimized: PropTypes.bool.isRequired
};

export default Burger;
