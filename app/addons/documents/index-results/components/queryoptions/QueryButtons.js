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
import { Button } from 'react-bootstrap';

export default class QueryButtons extends React.Component {
  constructor (props) {
    super(props);
    this.hideTray = this.hideTray.bind(this);
  }

  hideTray (ev) {
    if (ev && ev.preventDefault) {
      ev.preventDefault();
    }
    this.props.onCancel();
  }

  render () {
    return (
      <div className="row mx-2 mb-3 mt-0 text-end">
        <div id="button-options" className="col">
          <Button href="#" data-bypass="true" variant="cf-cancel" onClick={this.hideTray}>Cancel</Button>
          <Button type="submit" variant="cf-primary">Run Query</Button>
        </div>
      </div>
    );
  }
}

QueryButtons.propTypes = {
  onCancel: PropTypes.func.isRequired
};
