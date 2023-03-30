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
import FauxtonAPI from '../../../../../core/api';
import Form from 'react-bootstrap/Form';

export default class AdditionalParams extends React.Component {
  updateSkip (e) {
    e.preventDefault();
    let val = e.target.value;

    //check skip is only numbers
    if (!/^\d*$/.test(val)) {
      FauxtonAPI.addNotification({
        msg: 'Skip can only be a number',
        type: 'error'
      });
      val = this.props.skip;
    }

    this.props.updateSkip(val);
  }

  updateLimit (e) {
    e.preventDefault();
    this.props.updateLimit(e.target.value);
  }

  toggleDescending () {
    this.props.toggleDescending(this.props.descending);
  }

  render () {
    return (
      <>
        <div className="row m-2 mt-0 mb-3">
          <div className="col-12">
            <h5>Additional Parameters</h5>
          </div>
        </div>
        <div className='row m-2 mt-0 mb-3'>
          <div className="col-auto">
            <label htmlFor="qoLimit" className="col-form-label">Limit</label>
          </div>
          <div className="col">
            <Form.Select
              id="qoLimit"
              onChange={this.updateLimit.bind(this)}
              value={this.props.limit}
            >
              <option value="none">None</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
            </Form.Select>
          </div>
          <div className="col-auto">
            <label htmlFor="qoSkip" className="col-form-label">Skip</label>
          </div>
          <div className="col">
            <Form.Control
              id="qoSkip"
              type="number"
              value={this.props.skip}
              placeholder="# of rows"
              onChange={this.updateSkip.bind(this)}
            />
          </div>
        </div>

        <div className='row m-2 mt-0 mb-3'>
          <div className="col-6">
            <Form.Check
              id="qoDescending"
              label="Descending"
              onChange={this.toggleDescending.bind(this)}
              checked={this.props.descending}
              type="checkbox"
            />
          </div>
        </div>
      </>
    );
  }
}
