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
  'libs/react-bootstrap'
],

function (app, FauxtonAPI, React, Stores, Actions, ReactBootstrap) {
  var compactionStore = Stores.compactionStore;
  var Modal = ReactBootstrap.Modal;


  var CleanupViewsButton = React.createClass({
    propTypes: {
      database: React.PropTypes.object.isRequired
    },

    getStoreState: function () {
      return {
        cleanupViewsModalVisible: compactionStore.isCleanupViewsModalVisible(),
        currentDatabase: compactionStore.getCurrentDatabase(),
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
      if (this.isMounted()) {
        this.setState(this.getStoreState());
      }
    },

    cleanupViews: function () {
      Actions.cleanupViews(this.props.database);
    },

    openModal: function (e) {
      e.preventDefault();
      Actions.openCleanupViewsModal(this.props.database.id);
    },

    render: function () {
      return (
        <span>
          <a className="db-actions btn fonticon fonticon-recycle" title="Cleanup Views" onClick={this.openModal} />
          <CleanupViewsModal
            databaseName={this.props.database.id}
            visible={this.state.cleanupViewsModalVisible && this.state.currentDatabase === this.props.database.id}
            isCleaningViews={this.state.isCleaningViews}
            onSubmit={this.cleanupViews}
            onClose={Actions.closeCleanupViewsModal} />
        </span>
      );
    }
  });


  var CleanupViewsModal = React.createClass({
    propTypes: function () {
      return {
        databaseName: React.PropTypes.string.isRequired,
        visible: React.PropTypes.bool.isRequired,
        isCleaningViews: React.PropTypes.bool.isRequired,
        onSubmit: React.PropTypes.func.isRequired,
        onClose: React.PropTypes.func.isRequired
      };
    },

    render: function () {
      var btnText = 'Continue';
      if (this.props.isCleaningViews) {
        btnText = 'Cleaning Views...';
      }

      return (
        <Modal dialogClassName="cleanup-views-database-modal" show={this.props.visible} onHide={this.props.onClose}>
          <Modal.Header closeButton={true}>
            <Modal.Title>Cleanup Views</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Cleaning up views in a database removes old view files still stored on the filesystem. It is an irreversible
              operation.
            </p>

            <p>
              Do you want to cleanup the views in the <code>{this.props.databaseName}</code> database?
            </p>
          </Modal.Body>
          <Modal.Footer>
            <button className="cancel-button btn" onClick={this.props.onClose}>
              <i className="icon fonticon-circle-x" />
              Cancel
            </button>
            <button onClick={this.props.onSubmit} className="btn btn-success save" disabled={this.props.isCleaningViews}>
              <i className="fonticon-circle-check" /> {btnText}
            </button>
          </Modal.Footer>
        </Modal>
      );
    }
  });


  return {
    CleanupViewsButton: CleanupViewsButton
  };
});
