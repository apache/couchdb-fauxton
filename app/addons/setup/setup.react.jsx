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
  'addons/components/react-components.react',
  'addons/setup/setup.actions',
  'addons/setup/setup.stores',


], function (app, FauxtonAPI, React, ReactComponents, SetupActions, SetupStores) {

  var setupStore = SetupStores.setupStore;
  var ConfirmButton = ReactComponents.ConfirmButton;


  var ClusterConfiguredScreen = React.createClass({

    render: function () {
      return (
        <div className="setup-screen">
          {app.i18n.en_US['couchdb-productname']} is configured for production usage!
          <br />
          <br/>
          Do you want to <a href="#replication">replicate data</a>?
        </div>
      );
    }
  });

  var SetupCurrentAdminPassword = React.createClass({

    render: function () {
      var text = 'Your current Admin Username & Password';

      if (this.props.adminParty) {
        text = 'Admin Username & Password that you want to use';
      }

      return (
        <div className="setup-creds">
          <div>
            <h2>Specify Credentials</h2>
            {text}
          </div>
          <input
            className="setup-username"
            onChange={this.props.onAlterUsername}
            placeholder="Admin Username"
            type="text" />
          <input
            className="setup-password"
            onChange={this.props.onAlterPassword}
            placeholder="Admin Password"
            type="password" />
        </div>
      );
    },


  });


  var SetupOptionalSettings = React.createClass({
    getInitialState: function () {
      return {
        ipValue: this.props.ipInitialValue,
        portValue: this.props.portValue
      };
    },

    handleIpChange: function (event) {
      this.props.onAlterBindAddress(event);
      this.setState({ipValue: event.target.value});
    },

    handlePortChange: function (event) {
      this.props.onAlterPort(event);
      this.setState({portValue: event.target.value});
    },

    render: function () {
      return (
        <div className="setup-opt-settings">
          <h2>IP</h2>
          Bind address to listen on<br/>

          <input
            className="setup-input-ip"
            value={this.state.ipValue}
            onChange={this.handleIpChange}
            defaultValue="0.0.0.0"
            type="text" />

          <div className="setup-port">
            <h2>Port</h2>
            Port that the Node uses <br/>
            <input
              className="setup-input-port"
              value={this.state.portValue}
              onChange={this.handlePortChange}
              defaultValue="5984"
              type="text" />
          </div>
        </div>
      );
    }
  });

  var SetupMultipleNodesController = React.createClass({

    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        nodeList: setupStore.getNodeList(),
        isAdminParty: setupStore.getIsAdminParty(),
        remoteAddress: setupStore.getAdditionalNode().remoteAddress
      };
    },

    componentDidMount: function () {
      this.isAdminParty = setupStore.getIsAdminParty();
      setupStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      setupStore.off('change', this.onChange);
    },

    onChange: function () {
      if (this.isMounted()) {
        this.setState(this.getStoreState());
      }
    },

    getNodeList: function () {
      return this.state.nodeList.map(function (el, i) {
        return (
          <div key={i} className="node-item">
            {el.remoteAddress}:{el.port}
          </div>
        );
      }, this);
    },

    addNode: function () {
      SetupActions.addNode(this.isAdminParty);
    },

    alterPortAdditionalNode: function (e) {
      SetupActions.alterPortAdditionalNode(e.target.value);
    },

    alterBindAddressAdditionalNode: function (e) {
      SetupActions.alterBindAddressAdditionalNode(e.target.value);
    },

    alterRemoteAddressAdditionalNode: function (e) {
      SetupActions.alterRemoteAddressAdditionalNode(e.target.value);
    },

    alterUsername: function (e) {
      SetupActions.setUsername(e.target.value);
    },

    alterPassword: function (e) {
      SetupActions.setPassword(e.target.value);
    },

    alterBindAddressSetupNode: function (e) {
      SetupActions.setBindAddressForSetupNode(e.target.value);
    },

    alterPortSetupNode: function (e) {
      SetupActions.setPortForSetupNode(e.target.value);
    },

    finishClusterSetup: function () {
      SetupActions.finishClusterSetup('CouchDB Cluster set up!');
    },

    render: function () {

      return (
        <div className="setup-nodes">
          Setup your initial base-node, afterwards add the other nodes that you want to add
          <div className="setup-setupnode-section">
            <SetupCurrentAdminPassword
              onAlterUsername={this.alterUsername}
              onAlterPassword={this.alterPassword}
              adminParty={this.state.isAdminParty} />

            <SetupOptionalSettings
              onAlterPort={this.alterPortSetupNode}
              onAlterBindAddress={this.alterBindAddressSetupNode} />
            </div>
          <hr/>
          <div className="setup-add-nodes-section">
            <h2>Add Nodes</h2>
            Remote host <br/>
            <input
              value={this.state.remoteAddress}
              onChange={this.alterRemoteAddressAdditionalNode}
              className="input-remote-node"
              type="text"
              placeholder="127.0.0.1" />

            <SetupOptionalSettings
              onAlterPort={this.alterPortAdditionalNode}
              onAlterBindAddress={this.alterBindAddressAdditionalNode} />

            <div className="setup-add-button">
              <ConfirmButton
                onClick={this.addNode}
                id="setup-btn-no-thanks"
                text="ADD" />
            </div>
          </div>
          <div className="setup-nodelist">
            {this.getNodeList()}
          </div>

          <div className="centered setup-finish">
            <ConfirmButton onClick={this.finishClusterSetup} text="SETUP" />
          </div>
        </div>
      );
    }
  });

  var SetupSingleNodeController = React.createClass({

    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        isAdminParty: setupStore.getIsAdminParty()
      };
    },

    componentDidMount: function () {
      setupStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      setupStore.off('change', this.onChange);
    },

    onChange: function () {
      if (this.isMounted()) {
        this.setState(this.getStoreState());
      }
    },

    alterUsername: function (e) {
      SetupActions.setUsername(e.target.value);
    },

    alterPassword: function (e) {
      SetupActions.setPassword(e.target.value);
    },

    alterBindAddress: function (e) {
      SetupActions.setBindAddressForSetupNode(e.target.value);
    },

    alterPort: function (e) {
      SetupActions.setPortForSetupNode(e.target.value);
    },

    render: function () {
      return (
        <div className="setup-nodes">
          <div className="setup-setupnode-section">
            <SetupCurrentAdminPassword
              onAlterUsername={this.alterUsername}
              onAlterPassword={this.alterPassword}
              adminParty={this.state.isAdminParty} />
            <SetupOptionalSettings
              onAlterPort={this.alterPort}
              onAlterBindAddress={this.alterBindAddress} />
            <ConfirmButton onClick={this.finishSingleNode} text="Finish" />
          </div>
        </div>
      );
    },

    finishSingleNode: function (e) {
      e.preventDefault();
      SetupActions.setupSingleNode();
    }
  });

  var SetupFirstStepController = React.createClass({

    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        clusterState: setupStore.getClusterState()
      };
    },

    componentDidMount: function () {
      setupStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      setupStore.off('change', this.onChange);
    },

    onChange: function () {
      if (this.isMounted()) {
        this.setState(this.getStoreState());
      }
    },

    render: function () {
      if (this.state.clusterState === 'cluster_finished') {
        return (<ClusterConfiguredScreen />);
      }

      return (
        <div className="setup-screen">
          <h2>Welcome to {app.i18n.en_US['couchdb-productname']}!</h2>
          <p>
            The recommended way to run the wizard is directly on your
            node (e.g without a Loadbalancer) in front of it.
          </p>
          <p>
            Do you want to setup a cluster with multiple nodes
            or just a single node CouchDB installation?
          </p>
          <div>
            <ConfirmButton
              onClick={this.redirectToMultiNodeSetup}
              text="Setup cluster" />
            <ConfirmButton
              onClick={this.redirectToSingleNodeSetup}
              id="setup-btn-no-thanks"
              text="Single-Node-Setup" />
          </div>
        </div>
      );
    },

    redirectToSingleNodeSetup: function (e) {
      e.preventDefault();
      FauxtonAPI.navigate('#setup/singlenode');
    },

    redirectToMultiNodeSetup: function (e) {
      e.preventDefault();
      FauxtonAPI.navigate('#setup/multinode');
    }
  });

  return {
    SetupMultipleNodesController: SetupMultipleNodesController,
    SetupFirstStepController: SetupFirstStepController,
    ClusterConfiguredScreen: ClusterConfiguredScreen,
    SetupSingleNodeController: SetupSingleNodeController,
    SetupOptionalSettings: SetupOptionalSettings
  };
});
