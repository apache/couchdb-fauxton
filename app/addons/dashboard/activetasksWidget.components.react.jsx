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
  'addons/dashboard/stores',
  'addons/dashboard/actions'
], function (App, FauxtonAPI, React, Store, Action) {

  var activeTaskList = Store.dashboardStore;

  var currentIndex = 0;

  var ActiveTasksWidgetController = React.createClass({

    getStoreState: function () {
      return {
        collection: activeTaskList.getFilteredActiveTasks()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      Action.setPolling();
      activeTaskList.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      Action.clearPolling();
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
        <ActiveTaskWidget collection={collection} isEmpty={isEmpty}/>
      );
    }
  });

  var ActiveTaskWidget = React.createClass({

    render: function () {
      var collection = this.props.collection;
      var isEmpty = this.props.isEmpty;
      return (
        <div className="widget-container-row">
          <div className="widget-header">
            <a href={"#/activetasks"}>Active Replications</a>
          </div>
          <ActiveTaskContent collection={collection} isEmpty={isEmpty}/>
        </div>
      );
    }
  });

  var ActiveTaskContent = React.createClass({

    getStoreState: function () {
      return {
        filteredActiveTasks: this.props.collection
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentWillReceiveProps: function (nextProps) {
      this.setState({
        filteredActiveTasks: this.props.collection
      });
    },

    createActiveTasksBox: function () {
      if (this.state.filteredActiveTasks.length === 0) {
        return this.props.isEmpty ? this.noActiveTasks() : this.noActiveTasksMatchFilter();
      }

      return _.map(this.state.filteredActiveTasks, function (item, iteration) {
        return <ActiveTaskBox key={iteration} item={item} />;
      });
    },

    noActiveTasks: function () {
      return (
        <div className="noResult">
          <div className="noResultText">There are no current Active Tasks</div>
        </div>
      );
    },

    noActiveTasksMatchFilter: function () {
      return (
        <div className="noResult">
          <div className="noResultText">There are no current Active Tasks</div>
        </div>
      );
    },

    onClick: function (buttonId) {
      var endIndex = $('.active-tasks-box').length - 1;
      if (buttonId == 1) {
        if (currentIndex > 0) {
          currentIndex--;
          $('.active-tasks-box').animate({'left': '+=260px'});
        }
      } else {
        if (currentIndex < endIndex) {
          currentIndex++;
          $('.active-tasks-box').animate({'left': '-=260px'});
        }
      }
    },

    render: function () {
      var boxes = this.createActiveTasksBox();
      return (
        <div className="widget-body">
          <div className="cornerBtns left" onClick={this.onClick.bind(this, 1)}>
            <i className="fonticon-left-open size-60"></i>
          </div>
          <div className="widget-inner-body">
          {boxes}
          </div>
          <div className="cornerBtns right" onClick={this.onClick.bind(this, -1)}>
            <i className="fonticon-right-open size-60"></i>
          </div>
        </div>
      );
    }
  });

  var ActiveTaskBox = React.createClass({
    getInfo: function (item) {
      return {
        toDatabase: item.target,
        fromDatabase: item.source,
        progress: activeTasksHelpers.calculateProgress(item.checkpointed_source_seq[0], item.source_seq[0]),
        continuous: item.continuous
      };
    },

    render: function () {
      var data = this.getInfo(this.props.item);

      var toDatabaseName = data.toDatabase;
      var parsedToDatabaseName = activeTasksHelpers.parseDbName(toDatabaseName);
      var fromDatabaseName = data.fromDatabase;
      var parsedFromDatabaseName = activeTasksHelpers.parseDbName(fromDatabaseName);
      var progress = data.progress;

      var className = '';
      if (progress > 50) {
        className = ' high-contrast';
      } else {
        className = ' low-contrast';
      }

      var progressStr = activeTasksHelpers.getProgressStr(progress);

      progress = progress / 100;
      var style = {
        opacity: progress
      };


      return (
        <div className="active-tasks-box">
          <div className={className}>
            <div className="active-tasks-box-background" style={style}></div>
            <div className="active-tasks-toDatabase">
              <a href={activeTasksHelpers.getDbUrl(toDatabaseName)}>{parsedToDatabaseName}</a>
            </div>
            <div className="active-tasks-arrow">
              <i className="fonticon-up size-36"></i>
            </div>
            <div className="active-tasks-fromDatabase">
              <a href={activeTasksHelpers.getDbUrl(fromDatabaseName)}>{parsedFromDatabaseName}</a>
            </div>
            <div className="active-tasks-complete">{progressStr}</div>
          </div>
          <NonContinuousTag isContinuous={data.continuous}/>
        </div>
      );
    }
  });

  var NonContinuousTag = React.createClass({
    getTag: function () {
      var tag = '';
      if (!this.props.isContinuous) {
        tag = 'non-continuous';
      }
      return tag;
    },

    render: function () {
      return (
        <div className="non-continuous-tag">{this.getTag()}</div>
      );
    }

  });

  var activeTasksHelpers = {
    getProgressStr: function (item) {
      return item + '% Complete';
    },

    calculateProgress: function (checkpointed_source_seq, source_seq) {
      return Math.round((checkpointed_source_seq / source_seq) * 10000) / 100;
    },

    parseDbName: function (item) {
      if (item.indexOf("http://") !== -1) {
        if (item.indexOf("http://0.0.0.0") !== -1) {
          return item.split('/')[3];
        } else {
          var lastIndex = item.length;
          var splitIndex = item.indexOf(item.split('/')[3]);
          return item.substring(0, splitIndex) + " " + item.substring(splitIndex, lastIndex);
        }
      }
      return item;
    },

    getDbUrl: function (item) {
      if (item.indexOf("http://") !== -1) {
        if (item.indexOf("http://0.0.0.0") !== -1) {
          return '#/database/' + item.split('/')[3] + '/_all_docs';
        } else {
          return item;
        }
      } else {
        return '#/database/' + item + '/_all_docs';
      }
    }
  };

  return {
    ActiveTasksWidgetController: ActiveTasksWidgetController,
    ActiveTaskContent: ActiveTaskContent,
    ActiveTaskWidget: ActiveTaskWidget,
    ActiveTaskBox: ActiveTaskBox,
    NonContinuousTag: NonContinuousTag
  };
});

