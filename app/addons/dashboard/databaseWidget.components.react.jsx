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
  'react'
], function (App, FauxtonAPI, React) {

  var DatabasesWidgetController = React.createClass({

    getStoreState: function () {
      return {
        recentDatabases: null
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    render: function () {
      var recentDatabases = this.state.recentDatabases;
      return (
        <DatabaseWidget databaseList={recentDatabases}/>
      );
    }
  });

  var DatabaseWidget = React.createClass({
    render: function () {
      return (
        <div className="widget-container-row">
          <div className="widget-header">
            <a href={"#/_all_dbs"}>Recently Visited Databases</a>
          </div>
          <div className="widget-body">
            <div>{this.props.databaseList}</div>
          </div>
        </div>
      );
    }
  });

  return {
    DatabasesWidgetController: DatabasesWidgetController,
    DatabaseWidget: DatabaseWidget
  };
});
