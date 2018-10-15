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

export class TableHeader extends React.Component {

  constructor (props) {
    super(props);
    this.onTableHeaderClick = this.onTableHeaderClick.bind(this);
  }


  arrow = () => {
    const sortBy = this.props.sortByHeader;
    const currentName = this.props.headerName;
    const headerIsAscending = this.props.headerIsAscending;
    const arrow = headerIsAscending ? 'icon icon-caret-up' : 'icon icon-caret-down';

    if (sortBy === currentName) {
      return <i className={arrow}></i>;
    }
  };

  onTableHeaderClick = () => {
    this.props.onTableHeaderClick(this.props.headerName);
  };

  render() {
    return (
      <td className={`header-field ${this.props.headerName} tableheader`} onClick={this.onTableHeaderClick}>
        <label className="header-field label-text active-tasks-header noselect">
          {this.props.displayName} {this.arrow()}
        </label>
      </td>
    );
  }
}

export default class ActiveTasksTableHeader extends React.Component {
  static defaultProps = {
    headerNames : [
      ['type', 'Type'],
      ['database', 'Database'],
      ['started-on', 'Started on'],
      ['updated-on', 'Updated on'],
      ['pid', 'PID'],
      ['progress', 'Status']
    ]
  };

  createTableHeadingFields = () => {
    const {
      onTableHeaderClick,
      sortByHeader,
      headerIsAscending
    } = this.props;

    return this.props.headerNames.map(function (header) {
      return <TableHeader
        headerName={header[0]}
        displayName={header[1]}
        key={header[0]}
        onTableHeaderClick={onTableHeaderClick}
        sortByHeader={sortByHeader}
        headerIsAscending={headerIsAscending} />;
    });
  };

  render() {
    return (
      <thead>
        <tr>{this.createTableHeadingFields()}</tr>
      </thead>
    );
  }
}
