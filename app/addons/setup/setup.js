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
import FauxtonAPI from "../../core/api";
import React from "react";
import ReactComponents from "../components/react-components";
import SetupActions from "./setup.actions";
import SetupStores from "./setup.stores";

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
    var text = 'Specify your Admin credentials';

    if (this.props.adminParty) {
      text = 'Create Admin credentials.';
    }

    return (
      <div className="setup-creds">
        <div>
          <p>{text}</p>
        </div>
        <input
          className="setup-username"
          onChange={this.props.onAlterUsername}
          placeholder="Username"
          type="text" />
        <input
          className="setup-password"
          onChange={this.props.onAlterPassword}
          placeholder="Password"
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
        <p>Bind address the node will listen on</p>
        <input
          className="setup-input-ip"
          value={this.state.ipValue}
          onChange={this.handleIpChange}
          placeholder="IP Address"
          type="text" />

        <div className="setup-port">
          <p>Port that the node will use</p>
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
    this.setState(this.getStoreState());
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
          <h2>Add Nodes to the Cluster</h2>
          <p>Remote host</p>
          <input
            value={this.state.remoteAddress}
            onChange={this.alterRemoteAddressAdditionalNode}
            className="input-remote-node"
            type="text"
            placeholder="IP Address" />

          <SetupOptionalSettings
            onAlterPort={this.alterPortAdditionalNode}
            onAlterBindAddress={this.alterBindAddressAdditionalNode} />

          <div className="setup-add-button">
            <ConfirmButton
              onClick={this.addNode}
              showIcon={false}
              id="setup-btn-no-thanks"
              text="Add Node" />
          </div>
        </div>
        <div className="setup-nodelist">
          {this.getNodeList()}
        </div>

        <div className="centered setup-finish">
          <ConfirmButton onClick={this.finishClusterSetup} showIcon={false} text="Configure Cluster" />
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
    this.setState(this.getStoreState());
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
          <ConfirmButton
            onClick={this.finishSingleNode}
            text="Configure Node" />
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
    this.setState(this.getStoreState());
  },

  render: function () {
    if (this.state.clusterState === 'cluster_finished') {
      return (<ClusterConfiguredScreen />);
    }

    return (
      <div className="setup-screen">
        <h2>Welcome to {app.i18n.en_US['couchdb-productname']}!</h2>
        <p>
          This wizard should be run directly on the node, rather than through a load-balancer.
        </p>
        <p>
          You can configure a single node, or a multi-node CouchDB installation.
        </p>
        <div>
          <ConfirmButton
            onClick={this.redirectToMultiNodeSetup}
            showIcon={false}
            text="Configure	a Cluster" />
          <ConfirmButton
            onClick={this.redirectToSingleNodeSetup}
            showIcon={false}
            id="setup-btn-no-thanks"
            text="Configure	a Single Node" />
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

export default {
  SetupMultipleNodesController: SetupMultipleNodesController,
  SetupFirstStepController: SetupFirstStepController,
  ClusterConfiguredScreen: ClusterConfiguredScreen,
  SetupSingleNodeController: SetupSingleNodeController,
  SetupOptionalSettings: SetupOptionalSettings
};
