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
import Components from '../../components/react-components';

const {ConfirmButton} = Components;

export const ReplicationSubmit = ({onClear, disabled, onClick}) =>
  <div className="row mt-3">
    <div className="col-12 text-end">
      <a
        className="replication__clear-link"
        href="#"
        data-bypass="true"
        onClick={(e) => {
          e.preventDefault();
          onClear();
        }}>
      Clear
      </a>
      <ConfirmButton
        customIcon="fonticon-replicate"
        id="replicate"
        text="Start Replication"
        onClick={onClick}
        disabled={disabled}
      />
    </div>
  </div>;


ReplicationSubmit.propTypes = {
  disabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired
};
