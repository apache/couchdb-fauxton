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

    getCollection: function () {
      return this.state.collection;
    },

    render: function () {
      var collection = this.state.collection;
      var isEmpty = _.isEmpty(collection);
      return (
        <div className="dashboard-container">
          <ActiveTaskWidget collection={collection} isEmpty={isEmpty}/>
        </div>
        );
    }
  });

  var ActiveTaskWidget = React.createClass({

    getCollection: function () {
      return this.props.collection;
    },

    render: function () {
      var collection = this.props.collection;
      var isEmpty = this.props.isEmpty;
      return (
        <div className="widget-container-row">
          <div className="widget-header">
            <span>Active Replications</span>
          </div>
          <ActiveTaskContent collection={collection} isEmpty={isEmpty}/>
        </div>
        );
    }
  });

  var ActiveTaskContent = React.createClass({

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
        return <ActiveTaskBox key={iteration} item={item} />;
      });
    },

    noActiveTasks: function () {
      return (
        <span>No Result</span>
        );
    },

    noActiveTasksMatchFilter: function () {
      return (
        <span>No Result</span>
        );
    },

    render: function () {
      var boxes = this.createRows();
      return (
        <div className="widget-body">
        {boxes}
        </div>
        )
        ;
    }
  });

  var ActiveTaskBox = React.createClass({
    getInfo: function (item) {
      return {
        toDatabase: item.target,
        fromDatabase: item.source,
        progress: activeTasksHelpers.getProgress(item.progress)
      };
    },

    render: function () {
      var data = this.getInfo(this.props.item);
      return (
        <div className="active-tasks-box">
            <div className="active-tasks-toDatabase">{data.toDatabase}</div>
            <div className="active-tasks-arrow"><i className="fonticon-up size-36"></i></div>
            <div className="active-tasks-fromDatabase">{data.fromDatabase}</div>
            <div className="active-tasks-complete">{data.progress}</div>
        </div>
        );
    }
  });

  var activeTasksHelpers = {
    getProgress: function (item) {
      return item + '% Complete';
    }
  };

  return {
    DashboardController: DashboardController,
    ActiveTaskContent: ActiveTaskContent,
    ActiveTaskWidget: ActiveTaskWidget,
    ActiveTaskBox: ActiveTaskBox
  };
});

