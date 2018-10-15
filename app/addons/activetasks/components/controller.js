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
import ActiveTasksFilterTabs from './filtertabs';
import ActiveTaskTable from './table';

export default class ActiveTasksController extends React.Component {
  componentDidMount() {
    this.props.init();
  }

  setNewSearchTerm = (searchTerm) => {
    this.props.setSearchTerm(searchTerm);
  };

  switchTab = (newRadioButton) => {  //tabs buttons
    this.props.switchTab(newRadioButton);
  };

  tableHeaderOnClick = (headerClicked) => {
    this.props.sortByColumnHeader(headerClicked);
  };

  render() {
    const {isLoading, tasks, searchTerm, selectedRadio, sortByHeader, headerIsAscending} = this.props;

    const setSearchTerm = this.setNewSearchTerm;
    const onTableHeaderClick = this.tableHeaderOnClick;

    return (
      <div id="active-tasks-page" className="scrollable">
        <div className="inner">
          <ActiveTasksFilterTabs
            searchTerm={searchTerm}
            selectedRadio={selectedRadio}
            onSearch={setSearchTerm}
            onRadioClick={this.switchTab}/>
          <ActiveTaskTable
            isLoading={isLoading}
            tasks={tasks}
            searchTerm={searchTerm}
            selectedRadio={selectedRadio}
            onTableHeaderClick={onTableHeaderClick}
            sortByHeader={sortByHeader}
            headerIsAscending={headerIsAscending} />
        </div>
      </div>
    );
  }
}
