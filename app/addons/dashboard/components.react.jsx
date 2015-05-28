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
  'addons/dashboard/stores'
], function (App, FauxtonAPI, React, Store) {

  var activeTaskList = Store.dashboardStore;

  var DashboardController = React.createClass({

    getStoreState: function () {
      return {
        collection: activeTaskList.getCollection(),

        setPolling: activeTaskList.setPolling,
        clearPolling: activeTaskList.clearPolling
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      this.state.setPolling();
      activeTaskList.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      this.state.clearPolling();
      activeTaskList.off('change', this.onChange, this);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    render: function () {
      var collection = this.state.collection;
      var isEmpty = _.isEmpty(collection);
      return (
        <div>
          <ActiveTaskWidget collection={collection} isEmpty={isEmpty}/>
        </div>
        );
    }
  });

  var ActiveTaskWidget = React.createClass({

    render: function () {
      var collection = this.props.collection;
      var isEmpty = this.props.isEmpty;
      return (
        <div className="widget-container active-task-box">
          <div className="widget-header">
            <span>Active Tasks</span>
          </div>
          <hr className="widget-header-separator"/>
          <div className="active-task-table">
            <ActiveTaskTable collection={collection} isEmpty={isEmpty}/>
          </div>
        </div>
        );
    }
  });

  var ActiveTaskTable = React.createClass({

    getStoreState: function () {
      return {
        filteredTable: activeTaskList.getFilteredTable(this.props.collection)
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentWillReceiveProps: function (nextProps) {
      this.setState({
        filteredTable: activeTaskList.getFilteredTable(this.props.collection)
      });
    },

    createRows: function () {
      if (this.state.filteredTable.length === 0) {
        return this.props.isEmpty ? this.noActiveTasks() : this.noActiveTasksMatchFilter();
      }

      return _.map(this.state.filteredTable, function (item, iteration) {
        return <ActiveTaskTableBodyContents key={iteration} item={item} />;
      });
    },

    noActiveTasks: function () {
      return (
        <tr>
          <td className="noResult">No active tasks.</td>
        </tr>
        );
    },

    noActiveTasksMatchFilter: function () {
      return (
        <tr>
          <td className="noResult">No active tasks match with filter.</td>
        </tr>
        );
    },

    render: function () {
      var rows = this.createRows();
      return (
        <table className="widget-activeTask-table">
          <thead>
            <tr>
              <th className="pid-column">PID</th>
              <th className="type-column">Type</th>
              <th className="progress-column">Progress</th>
              <th className="updateOn-column">Updated On</th>
            </tr>
          </thead>
          <tbody>
          {rows}
          </tbody>
        </table>
        );
    }
  });

  var ActiveTaskTableBodyContents = React.createClass({
    getInfo: function (item) {
      return {
        type: item.type,
        updatedOn: activeTasksHelpers.getTimeInfo(item.updated_on),
        pid: item.pid.replace(/[<>]/g, ''),
        progress: activeTasksHelpers.getProgress(item.progress)
      };
    },

    render: function () {
      var rowData = this.getInfo(this.props.item);
      return (
        <tr>
          <td className="pid-column">{rowData.pid}</td>
          <td className="type-column">{rowData.type}</td>
          <td className="progress-column">{rowData.progress}</td>
          <td className="updateOn-column">{rowData.updatedOn}</td>
        </tr>
        );
    }

  });

  var activeTasksHelpers = {
    getTimeInfo: function (timeStamp) {
      var timeMessage = [
        App.helpers.formatDate(timeStamp)
      ];
      return timeMessage;
    },

    getProgress: function (item) {
      return item + '%';
    }
  };

  return {
    DashboardController: DashboardController,
    ActiveTaskTable: ActiveTaskTable,
    ActiveTaskWidget: ActiveTaskWidget,
    ActiveTaskTableBodyContents: ActiveTaskTableBodyContents
  };
});

