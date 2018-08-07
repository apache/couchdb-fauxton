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

import app from "../../app";
import React from "react";
import ReactDOM from "react-dom";
import Stores from "./stores";
import Resources from "./resources";
import Actions from "./actions";
import Components from "../components/react-components";
import Helpers from '../../helpers';

const {TabElement, TabElementWrapper, Polling} = Components;

const activeTasksStore = Stores.activeTasksStore;

export class ActiveTasksController extends React.Component {
  getStoreState = () => {
    return {
      collection: activeTasksStore.getCollection(),
      searchTerm: activeTasksStore.getSearchTerm(),
      selectedRadio: activeTasksStore.getSelectedRadio(),

      sortByHeader: activeTasksStore.getSortByHeader(),
      headerIsAscending: activeTasksStore.getHeaderIsAscending()

    };
  };

  componentDidMount() {
    Actions.init(new Resources.AllTasks());
    activeTasksStore.on('change', this.onChange, this);
  }

  componentWillUnmount() {
    activeTasksStore.off('change', this.onChange, this);
  }

  onChange = () => {
    this.setState(this.getStoreState());
  };

  setNewSearchTerm = (searchTerm) => {
    Actions.setSearchTerm(searchTerm);
  };

  switchTab = (newRadioButton) => {  //tabs buttons
    Actions.switchTab(newRadioButton);
  };

  tableHeaderOnClick = (headerClicked) => {
    Actions.sortByColumnHeader(headerClicked);
  };

  state = this.getStoreState();

  render() {
    const {collection, searchTerm, selectedRadio, sortByHeader, headerIsAscending} = this.state;

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
            collection={collection}
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

class ActiveTasksFilterTabs extends React.Component {
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

class ActiveTaskTable extends React.Component {
  render() {
    var collection = this.props.collection;
    var selectedRadio = this.props.selectedRadio;
    var searchTerm = this.props.searchTerm;
    var sortByHeader = this.props.sortByHeader;
    var onTableHeaderClick = this.props.onTableHeaderClick;
    var headerIsAscending = this.props.headerIsAscending;

    return (
      <div id="dashboard-lower-content">
        <table id="active-tasks-table" className="table table-bordered table-striped active-tasks">
          <ActiveTasksTableHeader
            onTableHeaderClick={onTableHeaderClick}
            sortByHeader={sortByHeader}
            headerIsAscending={headerIsAscending}/>
          <ActiveTasksTableBody
            collection={collection}
            selectedRadio={selectedRadio}
            searchTerm={searchTerm}/>
        </table>
      </div>
    );
  }
}

class ActiveTasksTableHeader extends React.Component {
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
    var onTableHeaderClick = this.props.onTableHeaderClick;
    var sortByHeader = this.props.sortByHeader;
    var headerIsAscending = this.props.headerIsAscending;
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

class TableHeader extends React.Component {
  arrow = () => {
    var sortBy = this.props.sortByHeader;
    var currentName = this.props.headerName;
    var headerIsAscending = this.props.headerIsAscending;
    var arrow = headerIsAscending ? 'icon icon-caret-up' : 'icon icon-caret-down';

    if (sortBy === currentName) {
      return <i className={arrow}></i>;
    }
  };

  onTableHeaderClick = (e) => {
    var headerSelected = e.target.value;
    this.props.onTableHeaderClick(headerSelected);
  };

  render() {
    var arrow = this.arrow();
    var th_class = 'header-field ' + this.props.headerName;

    return (
      <td className={th_class + " tableheader"} value={this.props.headerName}>
        <input
          type="radio"
          name="header-field"
          id={this.props.headerName}
          value={this.props.headerName}
          className="header-field radio"
          onChange={this.onTableHeaderClick} />
        <label
          className="header-field label-text active-tasks-header noselect"
          htmlFor={this.props.headerName}>
          {this.props.displayName} {arrow}
        </label>
      </td>
    );
  }
}

class ActiveTasksTableBody extends React.Component {
  getStoreState = () => {
    return {
      filteredTable: activeTasksStore.getFilteredTable(this.props.collection)
    };
  };

  UNSAFE_componentWillReceiveProps() {
    this.setState({
      filteredTable: activeTasksStore.getFilteredTable(this.props.collection)
    });
  }

  createRows = () => {
    var isThereASearchTerm = this.props.searchTerm.trim() === "";

    if (this.state.filteredTable.length === 0) {
      return isThereASearchTerm ? this.noActiveTasks() : this.noActiveTasksMatchFilter();
    }

    return _.map(this.state.filteredTable, (item, key) => {
      return <ActiveTaskTableBodyContents key={key} item={item} />;
    });
  };

  noActiveTasks = () => {
    var type = this.props.selectedRadio;
    if (type === "All Tasks") {
      type = "";
    }

    return (
      <tr className="no-matching-database-on-search">
        <td  colSpan="6">No active {type} tasks.</td>
      </tr>
    );
  };

  noActiveTasksMatchFilter = () => {
    var type = this.props.selectedRadio;
    if (type === "All Tasks") {
      type = "";
    }

    return (
      <tr className="no-matching-database-on-search">
        <td colSpan="6">No active {type} tasks match with filter: &quot;{this.props.searchTerm}&quot;</td>
      </tr>
    );
  };

  state = this.getStoreState();

  render() {
    return (
      <tbody className="js-tasks-go-here">
        {this.createRows()}
      </tbody>
    );
  }
}

class ActiveTaskTableBodyContents extends React.Component {
  getInfo = (item) => {
    return {
      type : item.type,
      objectField: activeTasksHelpers.getDatabaseFieldMessage(item),
      started_on: activeTasksHelpers.getTimeInfo(item.started_on),
      updated_on: activeTasksHelpers.getTimeInfo(item.updated_on),
      pid: item.pid.replace(/[<>]/g, ''),
      progress: activeTasksHelpers.getProgressMessage(item),
    };
  };

  multilineMessage = (messageArray, optionalClassName) => {

    if (!optionalClassName) {
      optionalClassName = '';
    }
    var cssClasses = 'multiline-active-tasks-message ' + optionalClassName;

    return messageArray.map(function (msgLine, iterator) {
      return <p key={iterator} className={cssClasses}>{msgLine}</p>;
    });
  };

  render() {
    var rowData =  this.getInfo(this.props.item);
    var objectFieldMsg = this.multilineMessage(rowData.objectField, 'to-from-database');
    var startedOnMsg = this.multilineMessage(rowData.started_on, 'time');
    var updatedOnMsg = this.multilineMessage(rowData.updated_on, 'time');
    var progressMsg = this.multilineMessage(rowData.progress);

    return (
      <tr>
        <td>{rowData.type}</td>
        <td>{objectFieldMsg}</td>
        <td>{startedOnMsg}</td>
        <td>{updatedOnMsg}</td>
        <td>{rowData.pid}</td>
        <td>{progressMsg}</td>
      </tr>
    );
  }
}

export class ActiveTasksPollingWidgetController extends React.Component {
  getStoreState = () => {
    return {
      collection:  activeTasksStore.getBackboneCollection()
    };
  };

  componentDidMount() {
    activeTasksStore.on('change', this.onChange, this);
  }

  componentWillUnmount() {
    activeTasksStore.off('change', this.onChange, this);
  }

  onChange = () => {
    this.setState(this.getStoreState());
  };

  runPollingUpdate = () => {
    Actions.runPollingUpdate(this.state.collection);
  };

  getPluralForLabel = () => {
    return this.state.pollingInterval === "1" ? '' : 's';
  };

  state = this.getStoreState();

  render() {
    let activePollingClass = "active-tasks__polling-wrapper";
    if (Helpers.isIE1X()) {
      activePollingClass += " " + activePollingClass + "--ie1X";
    }
    return (
      <div className={activePollingClass}>
        <Polling
          min={1}
          max={30}
          stepSize={1}
          startValue={15}
          valueUnits={"second"}
          onPoll={this.runPollingUpdate}
        />
      </div>
    );
  }
}

var activeTasksHelpers = {
  getTimeInfo (timeStamp) {
    var timeMessage = [
      app.helpers.formatDate(timeStamp),
      app.helpers.getDateFromNow(timeStamp)
    ];
    return timeMessage;
  },

  getDatabaseFieldMessage (item) {
    var type = item.type;
    var databaseFieldMessage = [];

    if (type === 'replication') {
      databaseFieldMessage.push('From: ' + item.source);
      databaseFieldMessage.push('To: ' + item.target);
    } else if (type === 'indexer') {
      databaseFieldMessage.push(item.database);
      databaseFieldMessage.push('(View: ' + item.design_document + ')');
    } else {
      databaseFieldMessage.push(item.database);
    }

    return databaseFieldMessage;
  },

  getProgressMessage (item) {
    var progressMessage = [];
    var type = item.type;

    if (_.has(item, 'progress')) {
      progressMessage.push('Progress: ' + item.progress + '%');
    }

    if (type === 'indexer') {
      progressMessage.push(
        'Processed ' + item.changes_done + ' of ' + item.total_changes + ' changes.'
      );
    } else if (type === 'replication') {
      progressMessage.push(item.docs_written + ' docs written.');

      if (_.has(item, 'changes_pending')) {
        progressMessage.push(item.changes_pending + ' pending changes.');
      }
    }

    if (_.has(item, 'changes_done')) {
      progressMessage.push(item.changes_done + ' Changes done.');
    }

    return progressMessage;
  },

  getSourceSequence (item) {
    return item.source_seq;
  }

};

export default {
  ActiveTasksController: ActiveTasksController,
  ActiveTasksFilterTabs: ActiveTasksFilterTabs,

  ActiveTaskTable: ActiveTaskTable,
  ActiveTasksTableHeader: ActiveTasksTableHeader,
  TableHeader: TableHeader,
  ActiveTasksTableBody: ActiveTasksTableBody,
  ActiveTaskTableBodyContents: ActiveTaskTableBodyContents,

  ActiveTasksPollingWidgetController: ActiveTasksPollingWidgetController
};
