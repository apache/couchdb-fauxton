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
import Components from "../../components/react-components";
const {TabElement, TabElementWrapper} = Components;

export default class ActiveTasksFilterTabs extends React.Component {
  static defaultProps = {
    radioNames : [
      'All Tasks',
      'Replication',
      'Database Compaction',
      'Indexer',
      'View Compaction'
    ]
  };

  checked = (radioName) => {
    return this.props.selectedRadio === radioName;
  };

  onRadioClick = (e) => {
    var radioName = e.target.value;
    this.props.onRadioClick(radioName);
  };

  createFilterTabs = () => {
    return (
      this.props.radioNames.map((radioName, i) => {
        const checked = this.checked(radioName);

        return (
          <TabElement
            key={i}
            selected={checked}
            text={radioName}
            onChange={this.onRadioClick} />
        );
      })
    );
  };

  searchTermChange = (e) => {
    var searchTerm = e.target.value;
    this.props.onSearch(searchTerm);
  };

  render() {
    const filterTabs = this.createFilterTabs();
    return (
      <TabElementWrapper>
        {filterTabs}
        <li className="component-tab-list-element">
          <input
            id="active-tasks-search-box"
            className="searchbox"
            type="text"
            name="search"
            placeholder="Search for databases..."
            value={this.props.searchTerm}
            onChange={this.searchTermChange} />
        </li>
      </TabElementWrapper>
    );
  }
}
