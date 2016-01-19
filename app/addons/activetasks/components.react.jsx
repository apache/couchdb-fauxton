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

define([
  'app',
  'api',
  'react',
  'react-dom',
  'addons/activetasks/stores',
  'addons/activetasks/resources',
  'addons/activetasks/actions',
  'addons/components/react-components.react',
  'addons/fauxton/components.react'
], function (app, FauxtonAPI, React, ReactDOM, Stores, Resources, Actions, Components, ComponentsReact) {

  var activeTasksStore = Stores.activeTasksStore;
  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

  var ActiveTasksController = React.createClass({

    getStoreState: function () {
      return {
        collection: activeTasksStore.getCollection(),
        searchTerm: activeTasksStore.getSearchTerm(),
        selectedRadio: activeTasksStore.getSelectedRadio(),

        sortByHeader: activeTasksStore.getSortByHeader(),
        headerIsAscending: activeTasksStore.getHeaderIsAscending(),

        setPolling: activeTasksStore.setPolling,
        clearPolling: activeTasksStore.clearPolling
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      this.state.setPolling();
      activeTasksStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      this.state.clearPolling();
      activeTasksStore.off('change', this.onChange, this);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    setNewSearchTerm: function (searchTerm) {
      Actions.setSearchTerm(searchTerm);
    },

    switchTab: function (newRadioButton) {  //tabs buttons
      Actions.switchTab(newRadioButton);
    },

    tableHeaderOnClick: function (headerClicked) {
      Actions.sortByColumnHeader(headerClicked);
    },

    render: function () {
      var collection = this.state.collection;
      var searchTerm = this.state.searchTerm;
      var selectedRadio = this.state.selectedRadio;
      var sortByHeader = this.state.sortByHeader;
      var headerIsAscending = this.state.headerIsAscending;

      var setSearchTerm = this.setNewSearchTerm;
      var onTableHeaderClick = this.tableHeaderOnClick;

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
  });

  var ActiveTasksFilterTabs = React.createClass({
    getDefaultProps: function () {
      return {
        radioNames : [
          'All Tasks',
          'Replication',
          'Database Compaction',
          'Indexer',
          'View Compaction'
        ]
      };
    },

    checked: function (radioName) {
      return this.props.selectedRadio === radioName;
    },

    onRadioClick: function (e) {
      var radioName = e.target.value;
      this.props.onRadioClick(radioName);
    },

    createFilterTabs: function () {
      return (
        this.props.radioNames.map(function (radioName) {
          var checked = this.checked(radioName);
          var id = radioName.replace(' ', '-');
          var radioClassName = "radio-" + id;
          var radioClick = this.onRadioClick;
          var checkedClassName = checked ? 'active-tasks-checked' : '';

          return (
            <li className={"active-tasks-one-checkbox " + checkedClassName} key={radioName + "li"}>
              <input
                  className="toggle-filter-tab"
                  data-bypass="true"
                  id={id}
                  type="radio"
                  key ={radioName}
                  name="radio-button-active-task-filter-tray"
                  value={radioName}
                  checked={checked}
                  onChange={radioClick} />
              <label htmlFor={id} className="active-tasks-checkbox-label">
              {radioName}
              </label>
            </li>
          );
        }.bind(this))
      );
    },

    searchTermChange: function (e) {
      var searchTerm = e.target.value;
      this.props.onSearch(searchTerm);
    },

    render: function () {
      var filterTabs = this.createFilterTabs();
      return (
        <ul className="nav nav-tabs" id="active-tasks-filter-tabs">
          {filterTabs}
          <li>
            <input
              id="active-tasks-search-box"
              className="searchbox"
              type="text"
              name="search"
              placeholder="Search for databases..."
              value={this.props.searchTerm}
              onChange={this.searchTermChange} />
          </li>
        </ul>);
    }
  });

  var ActiveTaskTable = React.createClass({
    render: function () {
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
  });

  var ActiveTasksTableHeader = React.createClass({
    getDefaultProps: function () {
      return {
        headerNames : [
          ['type', 'Type'],
          ['database', 'Database'],
          ['started-on', 'Started on'],
          ['updated-on', 'Updated on'],
          ['pid', 'PID'],
          ['progress', 'Status']
        ]
      };
    },

    createTableHeadingFields: function () {
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
    },

    render: function () {
      return (
        <thead>
          <tr>{this.createTableHeadingFields()}</tr>
        </thead>
      );
    }
  });

  var TableHeader = React.createClass({
    arrow: function () {
      var sortBy = this.props.sortByHeader;
      var currentName = this.props.headerName;
      var headerIsAscending = this.props.headerIsAscending;
      var arrow = headerIsAscending ? 'icon icon-caret-up' : 'icon icon-caret-down';

      if (sortBy === currentName) {
        return <i className={arrow}></i>;
      }
    },

    onTableHeaderClick: function (e) {
      var headerSelected = e.target.value;
      this.props.onTableHeaderClick(headerSelected);
    },

    render: function () {
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
  });

  var ActiveTasksTableBody = React.createClass({

    getStoreState: function () {
      return {
        filteredTable: activeTasksStore.getFilteredTable(this.props.collection)
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentWillReceiveProps: function (nextProps) {
      this.setState({
        filteredTable: activeTasksStore.getFilteredTable(this.props.collection)
      });
    },

    createRows: function () {
      var isThereASearchTerm = this.props.searchTerm.trim() === "";

      if (this.state.filteredTable.length === 0) {
        return isThereASearchTerm ? this.noActiveTasks() : this.noActiveTasksMatchFilter();
      }

      return _.map(this.state.filteredTable, function (item, key) {
        return <ActiveTaskTableBodyContents key={key} item={item} />;
      });
    },

    noActiveTasks: function () {
      var type = this.props.selectedRadio;
      if (type === "All Tasks") {
        type = "";
      }

      return (
        <tr className="no-matching-database-on-search">
          <td  colSpan="6">No active {type} tasks.</td>
        </tr>
      );
    },

    noActiveTasksMatchFilter: function () {
      var type = this.props.selectedRadio;
      if (type === "All Tasks") {
        type = "";
      }

      return (
        <tr className="no-matching-database-on-search">
          <td colSpan="6">No active {type} tasks match with filter: "{this.props.searchTerm}"</td>
        </tr>
      );
    },

    render: function () {
      return (
        <tbody className="js-tasks-go-here">
        {this.createRows()}
        </tbody>
      );
    }
  });

  var ActiveTaskTableBodyContents = React.createClass({
    getInfo: function (item) {
      return {
        type : item.type,
        objectField: activeTasksHelpers.getDatabaseFieldMessage(item),
        started_on: activeTasksHelpers.getTimeInfo(item.started_on),
        updated_on: activeTasksHelpers.getTimeInfo(item.updated_on),
        pid: item.pid.replace(/[<>]/g, ''),
        progress: activeTasksHelpers.getProgressMessage(item),
      };
    },

    multilineMessage: function (messageArray, optionalClassName) {

      if (!optionalClassName) {
        optionalClassName = '';
      }
      var cssClasses = 'multiline-active-tasks-message ' + optionalClassName;

      return messageArray.map(function (msgLine, iterator) {
        return <p key={iterator} className={cssClasses}>{msgLine}</p>;
      });
    },

    render: function () {
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
          <td>{progressMsg}<ActiveTasksViewSourceSequence item={this.props.item}/></td>
        </tr>
      );
    }
  });

  var ActiveTasksViewSourceSequence = React.createClass({
    onTrayToggle: function (e) {
      e.preventDefault();
      this.refs.view_source_sequence_btn.toggle(function (shown) {
        if (shown) {
          ReactDOM.findDOMNode(this.refs.view_source_sequence_btn).focus();
        }
      }.bind(this));
    },

    sequences: function (item) {
      if (_.isNumber(item) || _.isString(item)) {
        return <ComponentsReact.ClipboardWithTextField textToCopy={item} uniqueKey={item}/>;
      }

      if (_.isArray(item)) {
        return _.map(item, function (seq, i) {
            return <ComponentsReact.ClipboardWithTextField textToCopy={seq} uniqueKey={i + Math.random(100)} key={i}/>;
          });
      }

      return  <ComponentsReact.ClipboardWithTextField textToCopy="???" uniqueKey='unknownRevision'/>;
    },

    render: function () {

      if (_.has(this.props.item, 'source_seq')) {
        var sequences = this.sequences(this.props.item.source_seq);
        return (
          <div>
            Current source sequence:
            <a href="#"
              className="view-source-sequence-btn"
              onClick={this.onTrayToggle}
              data-bypass="true">
              View
            </a>
            <ComponentsReact.Tray ref="view_source_sequence_btn" className="view-source-sequence-tray">
              <span className="add-on">Source Sequence</span>
              {sequences}
            </ComponentsReact.Tray>
          </div>
        );
      }
      return null;
    }
  });

  var ActiveTasksPollingWidgetController = React.createClass({

    getStoreState: function () {
      return {
        pollingInterval:  activeTasksStore.getPollingInterval(),
        isLoading: activeTasksStore.isLoading()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      activeTasksStore.on('change', this.onChange, this);
    },

    onChange: function () {
      if (this.isMounted()) {
        this.setState(this.getStoreState());
      }
    },

    pollingIntervalChange: function (event) {
      Actions.changePollingInterval(event.target.value);
    },

    getPluralForLabel: function () {
      return this.state.pollingInterval === "1" ? '' : 's';
    },

    createPollingWidget: function () {
      var pollingInterval = this.state.pollingInterval;
      var s = this.getPluralForLabel();
      var onChangeHandle = this.pollingIntervalChange;

      return (
        <ul className="polling-interval-widget">
          <li className="polling-interval-name">Polling interval
            <label className="polling-interval-time-label" htmlFor="polling-range">
              <span>{pollingInterval}</span> second{s}
            </label>
          </li>
          <li>
            <input
              id="polling-range"
              type="range"
              min="1"
              max="30"
              step="1"
              value={pollingInterval}
              onChange={onChangeHandle}/>
          </li>
        </ul>
      );
    },

    render: function () {
      var pollingWidget = this.createPollingWidget();
      var loadLines = null;

      if (this.state.isLoading || this.state.pollingInterval === "1") {
        // show loading lines constantly if the polling interval is
        // 1 second, so that the lines aren't choppy
        loadLines = <Components.LoadLines />;
      }

      return (
        <div className="active-tasks-loading-lines-container">
          <span className="active-tasks-loading-lines">
            {loadLines}
          </span>
          {pollingWidget}
        </div>
      );
    }
  });

  var activeTasksHelpers = {
    getTimeInfo: function (timeStamp) {
      var timeMessage = [
          app.helpers.formatDate(timeStamp),
          app.helpers.getDateFromNow(timeStamp)
        ];
      return timeMessage;
    },

    getDatabaseFieldMessage: function (item) {
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

    getProgressMessage: function (item) {
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

    getSourceSequence: function (item) {
      return item.source_seq;
    }

  };

  return {
    ActiveTasksController: ActiveTasksController,
    ActiveTasksFilterTabs: ActiveTasksFilterTabs,

    ActiveTaskTable: ActiveTaskTable,
    ActiveTasksTableHeader: ActiveTasksTableHeader,
    TableHeader: TableHeader,
    ActiveTasksTableBody: ActiveTasksTableBody,
    ActiveTaskTableBodyContents: ActiveTaskTableBodyContents,
    ActiveTasksViewSourceSequence: ActiveTasksViewSourceSequence,

    ActiveTasksPollingWidgetController: ActiveTasksPollingWidgetController
  };

});
