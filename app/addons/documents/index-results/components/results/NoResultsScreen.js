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

export default function NoResultsScreen ({ text, isWarning }) {
  const warningMsg = (
    <div className='no-results-screen-warning'>
      <i className='fonticon-attention-circled'></i>
      {text}
    </div>
  );
  return (
    <div className="no-results-screen">
      {isWarning ? warningMsg : null}
      <div className="watermark-logo"></div>
      {!isWarning ? <h3>{text}</h3> :  null}
    </div>
  );
}

NoResultsScreen.propTypes = {
  text: PropTypes.string.isRequired
};
