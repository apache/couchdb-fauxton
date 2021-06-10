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


const NavLink = ({link, active, isMinimized}) => {

  const isActive = active === link.title;
  const linkClass = classNames(
    'faux-navbar__link',
    {'faux-navbar__link--active':  isActive},
    {'faux-navbar__link--inactive': !isActive},
    {'faux-navbar--wide':  !isMinimized},
    {'faux-navbar--narrow': isMinimized}
  );

  const linkTitle = isMinimized ?
    null :
    <span className="faux-navbar__text">{link.title}</span>;

  let linkIcon = null;
  if (link.icon) {
    linkIcon = (
      <i aria-hidden="true" className={classNames(
        link.icon,
        'fonticon faux-navbar__icon',
        {'faux-navbar__icon-badge': link.badge})}>
      </i>
    );
  }

  return (
    <a aria-current={isActive ? "page" : null } aria-label={link.title} className={linkClass} href={link.href} target={link.target ? '_blank' : null} rel="noreferrer noopener" data-bypass={link.target ? 'true' : null}>
      <div data-nav-name={link.title} className="faux-navbar__itemarea">
        {linkIcon}
        {linkTitle}
      </div>
    </a>
  );
};

NavLink.propTypes = {
  link: PropTypes.object.isRequired,
  active: PropTypes.string,
  isMinimized: PropTypes.bool.isRequired,
};


export default NavLink;
