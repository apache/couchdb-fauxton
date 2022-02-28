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
import ActiveTaskTableBodyContents from './tablebodycontents';

export default class ActiveTasksTableBody extends React.Component {
  createRows = () => {
    var isThereASearchTerm = this.props.searchTerm.trim() === "";

    if (this.props.tasks.length === 0 || this.props.isLoading) {
      return isThereASearchTerm ? this.noActiveTasks() : this.noActiveTasksMatchFilter();
    }

    return this.props.tasks.map((item, key) => {
      return <ActiveTaskTableBodyContents key={key} item={item} />;
    });
  };

  getType = () => {
    const type = this.props.selectedRadio;
    if (type === "All Tasks") {
      return "";
    }

    return type;
  };

  noActiveTasks = () => {
    const type = this.getType();
    let msg = <td  colSpan="6">No active {type} tasks.</td>;

    if (this.props.isLoading) {
      msg = <td  colSpan="6">Loading tasks.</td>;
    }

    return (
      <tr className="no-matching-database-on-search">
        {msg}
      </tr>
    );
  };

  noActiveTasksMatchFilter = () => {
    const type = this.getType();

    return (
      <tr className="no-matching-database-on-search">
        <td colSpan="6">No active {type} tasks match with filter: &quot;{this.props.searchTerm}&quot;</td>
      </tr>
    );
  };

  render() {
    return (
      <tbody className="js-tasks-go-here">
        {this.createRows()}
      </tbody>
    );
  }
}
