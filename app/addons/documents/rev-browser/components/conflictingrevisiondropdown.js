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

import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const BackForwardControls = ({onClick, forward}) => {
  const icon = forward ? 'fonticon-right-open' : 'fonticon-left-open';
  return <div className={icon} onClick={onClick}></div>;
};

BackForwardControls.propTypes = {
  onClick: PropTypes.func.isRequired,
  forward: PropTypes.bool,
};

BackForwardControls.defaultProps = {
  forward: false,
};

const ConflictingRevisionsDropDown = ({options, selected, onRevisionClick, onBackwardClick, onForwardClick}) => {
  const selectOptions = !options ? undefined :
    options.map(el => <option value={el.value} key={el.value}>{el.label}</option>);

  return (
    <div className="conflicting-revs-dropdown">
      <BackForwardControls onClick={onBackwardClick} />
      <Form.Select
        name="form-field-name"
        value={selected}
        onChange={onRevisionClick}>
        {selectOptions}
      </Form.Select>

      <BackForwardControls forward onClick={onForwardClick} />
    </div>
  );
};
ConflictingRevisionsDropDown.propTypes = {
  options: PropTypes.array.isRequired,
  selected: PropTypes.string.isRequired,
  onRevisionClick: PropTypes.func.isRequired,
  onBackwardClick: PropTypes.func.isRequired,
  onForwardClick: PropTypes.func.isRequired,
};

export default ConflictingRevisionsDropDown;
