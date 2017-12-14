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
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import ReactSelect from "react-select";

const BackForwardControls = ({onClick, forward}) => {
  const icon = forward ? 'fonticon-right-open' : 'fonticon-left-open';
  const style = {height: '20px', width: '11px', marginTop: '7px'};

  return <div style={style} className={icon} onClick={onClick}></div>;
};

BackForwardControls.propTypes = {
  onClick: PropTypes.func.isRequired,
};

const ConflictingRevisionsDropDown = ({options, selected, onRevisionClick, onBackwardClick, onForwardClick}) => {
  return (
    <div className="conflicting-revs-dropdown">
      <BackForwardControls backward onClick={onBackwardClick} />
      <div style={{width: '345px', margin: '0 5px'}}>
        <ReactSelect
          name="form-field-name"
          value={selected}
          options={options}
          clearable={false}
          onChange={onRevisionClick} />
      </div>
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
