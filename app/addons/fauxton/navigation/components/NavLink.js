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

  const linkClass = classNames(
    'faux-navbar__link',
    {'faux-navbar__link--active':  active === link.title},
    {'faux-navbar__link--inactive': active !== link.title},
    {'faux-navbar--wide':  !isMinimized},
    {'faux-navbar--narrow': isMinimized}
  );

  return (
    <a className={linkClass} href={link.href} target={link.target ? '_blank' : null} data-bypass={link.target ? 'true' : null}>
      <div data-nav-name={link.title} className="faux-navbar__itemarea">

        {!!link.icon ?
          <i className={classNames(link.icon, 'fonticon faux-navbar__icon')}></i> :
          null
        }
        {isMinimized ?
          null :
          <span className="faux-navbar__text">{link.title}</span>
        }
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
