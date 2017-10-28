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

const LoginButton = ({isMinimized}) => {

  const containerClasses = classNames(
    'faux-navbar__login__textcontainer',
    {'faux-navbar__login__textcontainer--narrow':  isMinimized},
    {'faux-navbar__login__textcontainer--wide': !isMinimized}
  );

  return (
    <a className="faux-login__link" href="#/login">

      <div className={containerClasses}>
        <span className="faux-navbar__logout__text">
          Login
        </span>
      </div>

    </a>
  );
};

LoginButton.propTypes = {
  isMinimized: PropTypes.bool.isRequired
};

export default LoginButton;
