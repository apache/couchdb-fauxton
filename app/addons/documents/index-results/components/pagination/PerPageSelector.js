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

export default class PerPageSelector extends React.Component {
  constructor (props) {
    super(props);
  }

  perPageChange (e) {
    const perPage = parseInt(e.target.value, 10);
    this.props.perPageChange(perPage);
  }

  getOptions () {
    return _.map(this.props.options, (i) => {
      return (<option value={i} key={i}>{i}</option>);
    });
  }

  render () {
    return (
      <div id="per-page">
        <label htmlFor="select-per-page" className="drop-down inline">
          {this.props.label} &nbsp;
          <select id="select-per-page" onChange={this.perPageChange.bind(this)} value={this.props.perPage.toString()} className="input-small">
            {this.getOptions()}
          </select>
        </label>
      </div>
    );
  }

}

PerPageSelector.defaultProps = {
  label: 'Documents per page: ',
  options: [5, 10, 20, 30, 50, 100]
};

PerPageSelector.propTypes = {
  perPage: PropTypes.number.isRequired,
  perPageChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  options: PropTypes.array
};
