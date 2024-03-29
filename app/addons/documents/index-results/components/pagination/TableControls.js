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

export default class TableControls extends React.Component {
  constructor (props) {
    super(props);
  }

  getAmountShownFields () {
    const fields = this.props.displayedFields;

    if (fields.shown === fields.allFieldCount) {
      return (
        <div className="float-start shown-fields">
          Showing {fields.shown} columns.
        </div>
      );
    }

    return (
      <div className="float-start shown-fields">
        Showing {fields.shown} of {fields.allFieldCount} columns.
      </div>
    );
  }

  render () {
    const { prioritizedEnabled, toggleShowAllColumns } = this.props;

    return (
      <div className="footer-table-control">
        {this.getAmountShownFields()}
        <div className="footer-doc-control-prioritized-wrapper float-start">
          <label htmlFor="footer-doc-control-prioritized">
            <input
              id="footer-doc-control-prioritized"
              checked={prioritizedEnabled}
              onChange={toggleShowAllColumns}
              type="checkbox">
            </input>
            Show all columns.
          </label>
        </div>
      </div>
    );
  }
}

TableControls.propTypes = {
  prioritizedEnabled: PropTypes.bool.isRequired,
  displayedFields: PropTypes.object.isRequired,
  toggleShowAllColumns: PropTypes.func.isRequired
};
