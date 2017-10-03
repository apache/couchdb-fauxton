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

export default function PagingControls ({ nextClicked, previousClicked, canShowPrevious, canShowNext }) {
  let canShowPreviousClassName = '';
  let canShowNextClassName = '';

  if (!canShowPrevious) {
    canShowPreviousClassName = 'disabled';
  }

  if (!canShowNext) {
    canShowNextClassName = 'disabled';
  }

  return (
    <div className="documents-pagination">
      <ul className="pagination">
        <li className={canShowPreviousClassName} >
          <a id="previous" onClick={previousClicked} className="icon fonticon-left-open" href="#" data-bypass="true"></a>
        </li>
        <li className={canShowNextClassName} >
          <a id="next" onClick={nextClicked} className="icon fonticon-right-open" href="#" data-bypass="true"></a>
        </li>
      </ul>
    </div>
  );
}

PagingControls.propTypes = {
  nextClicked: PropTypes.func.isRequired,
  previousClicked: PropTypes.func.isRequired,
  canShowPrevious: PropTypes.bool.isRequired,
  canShowNext: PropTypes.bool.isRequired
};
