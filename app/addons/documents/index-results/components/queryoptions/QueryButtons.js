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

export default class QueryButtons extends React.Component {
  constructor (props) {
    super(props);
  }

  hideTray () {
    this.props.onCancel();
  }

  render () {
    return (
      <div className="controls-group query-group">
        <div id="button-options" className="controls controls-row">
          <button type="submit" className="btn btn-secondary">Run Query</button>
          <a onClick={this.hideTray.bind(this)} className="btn btn-cancelDark">Cancel</a>
        </div>
      </div>
    );
  }
}

QueryButtons.propTypes = {
  onCancel: PropTypes.func.isRequired
};
