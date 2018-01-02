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
      <div className="query-group" id="query-options-additional-params">
        <div className="add-on additionalParams">Additional Parameters</div>
        <div className="row-fluid fieldsets">
          <div className="dropdown inline">
            <label className="drop-down">
              Limit
              <select id="qoLimit" onChange={this.updateLimit.bind(this)} name="limit" value={this.props.limit} className="input-small">
                <option value="none">None</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={500}>500</option>
              </select>
            </label>
          </div>
        </div>
        <div className="row-fluid fieldsets">
          <div className="checkbox inline">
            <input id="qoDescending" type="checkbox" onChange={this.toggleDescending.bind(this)} checked={this.props.descending} />
            <label htmlFor="qoDescending">Descending</label>
          </div>
          <div className="dropdown inline">
            <label htmlFor="qoSkip" className="drop-down">
              Skip
              <input value={this.props.skip} onChange={this.updateSkip.bind(this)} className="input-small" type="number" id="qoSkip" placeholder="# of rows" />
            </label>
          </div>
        </div>
      </div>
    );
  }
}
