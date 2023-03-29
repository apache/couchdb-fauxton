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
import CloseButton from 'react-bootstrap/CloseButton';

const PermissionsItem = ({removeItem, section, type, value}) => {

  return (
    <li>
      <span>{value}</span>
      <CloseButton className="float-end" aria-label="Remove item" onClick={() => removeItem(section, type, value)} />
    </li>
  );
};

PermissionsItem.propTypes = {
  value: PropTypes.string.isRequired,
  removeItem: PropTypes.func.isRequired,
};

export default PermissionsItem;
