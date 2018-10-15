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
import ReactDOM from 'react-dom';
import ReactComponents from '../../../components/react-components';
import AddFilterForm from './AddFilterForm';

export default class ChangesTabContent extends React.Component {
  constructor (props) {
    super(props);
    this.addFilter = this.addFilter.bind(this);
    this.hasFilter = this.hasFilter.bind(this);
  }

  addFilter (newFilter) {
    if (_.isEmpty(newFilter)) {
      return;
    }
    this.props.addFilter(newFilter);
  }

  hasFilter (filter) {
    return this.props.filters.includes(filter);
  }

  render () {
    return (
      <div className="changes-header">
        <AddFilterForm filter={(label) => this.props.removeFilter(label)} addFilter={this.addFilter}
          hasFilter={this.hasFilter} />
        <ReactComponents.BadgeList elements={this.props.filters} removeBadge={(label) => this.props.removeFilter(label)} />
      </div>
    );
  }
}

ChangesTabContent.propTypes = {
  filters: PropTypes.array.isRequired,
  addFilter: PropTypes.func.isRequired,
  removeFilter: PropTypes.func.isRequired
};
