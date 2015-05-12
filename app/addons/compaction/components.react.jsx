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
  'addons/compaction/stores',
  'addons/compaction/actions',
  'addons/components/react-components.react'
],

function (app, FauxtonAPI, React, Stores, Actions, Components, ReactComponents) {
  var compactionStore = Stores.compactionStore;

  var CompactDatabase = React.createClass({

    run: function (e) {
      this.props.compactDatabase();
    },

    render: function () {
      var btnText = 'Run';

      if (this.props.isCompacting) {
        btnText = 'Compacting...';
      }

      return (
        <div className="row-fluid">
          <div className="span12 compaction-option">
            <h3>Compact Database</h3>
            <p>Compacting a database removes deleted documents and previous revisions. It is an irreversible operation and may take a while to complete for large databases.</p>
            <button id="compact-db" disabled={this.props.isCompacting} onClick={this.run} className="btn btn-large btn-primary">{btnText}</button>
          </div>
        </div>
      );
    }

  });

  var CleanView = React.createClass({

    run: function (e) {
      this.props.cleanupView();
    },

    render: function () {
      var btnText = 'Run';

      if (this.props.isCleaningView) {
        btnText = 'Cleaning Views...';
      }
      return (
        <div className="row-fluid">
          <div className="span12 compaction-option">
            <h3>Cleanup Views</h3>
            <p>Cleaning up views in a database removes old view files still stored on the filesystem. It is an irreversible operation.</p>
            <button id="cleanup-views" onClick={this.run} className="btn btn-large btn-primary">{btnText}</button>
          </div>
        </div>
      );
    }

  });

  var CompactionController = React.createClass({
    getStoreState: function () {
      return {
        database: compactionStore.getDatabase(),
        isCompacting: compactionStore.isCompacting(),
        isCleaningViews: compactionStore.isCleaningViews()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      compactionStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      compactionStore.off('change', this.onChange);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    compactDatabase: function () {
      Actions.compactDatabase(this.state.database);
    },

    cleanupView: function () {
      Actions.cleanupViews(this.state.database);
    },

    render: function () {
      return (
        <div>
          <CompactDatabase isCompacting={this.state.isCompacting} compactDatabase={this.compactDatabase} />
          <CleanView isCleaningView={this.state.isCleaningViews} cleanupView={this.cleanupView}/>
        </div>
      );
    }
  });

  var ViewCompactionButton = React.createClass({
    onClick: function (e) {
      e.preventDefault();
      Actions.compactView(this.props.database, this.props.designDoc);
    },

    getStoreState: function () {
      return {
        isCompactingView: compactionStore.isCompactingView()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      compactionStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      compactionStore.off('change', this.onChange);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    render: function () {
      var btnMsg = 'Compact View';

      if (this.state.isCompactingView) {
        btnMsg = 'Compacting View';
      }

      return (
        <button disabled={this.state.isCompactingView}
          className="btn btn-info pull-right"
          onClick={this.onClick}>{btnMsg}</button>
      );
    }

  });

  return {
    CompactDatabase: CompactDatabase,
    CleanView: CleanView,
    CompactionController: CompactionController,
    ViewCompactionButton: ViewCompactionButton
  };
});
