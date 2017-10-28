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


class ClusterConfiguredScreen extends React.Component {
  getStoreState = () => {
    return {
      clusterState: setupStore.getClusterState()
    };
  };

  componentDidMount() {
    setupStore.on('change', this.onChange, this);
  }

  componentWillUnmount() {
    setupStore.off('change', this.onChange);
  }

  onChange = () => {
    this.setState(this.getStoreState());
  };

  getNodeType = () => {
    if (this.state.clusterState === 'cluster_finished') {
      return 'clustered';
    } else if (this.state.clusterState === 'single_node_enabled') {
      return 'single';
    } else {
      return 'unknown state';
    }
  };

  state = this.getStoreState();

  render() {
    var nodetype = this.getNodeType();

    return (
      <div className="setup-screen">
        {app.i18n.en_US['couchdb-productname']} is configured for production usage as a {nodetype} node!
        <br />
        <br/>
        Do you want to <a href="#replication">replicate data</a>?
      </div>
    );
  }
}

class SetupCurrentAdminPassword extends React.Component {
  render() {
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
  }
}

class SetupNodeCountSetting extends React.Component {
  state = {
    nodeCountValue: this.props.nodeCountValue
  };

  handleNodeCountChange = (event) => {
    this.props.onAlterNodeCount(event);
    this.setState({nodeCountValue: event.target.value});
  };

  render() {
    return (
      <div className="setup-node-count">
        <p>Number of nodes to be added to the cluster (including this one)</p>
        <input
          className="setup-input-nodecount"
          value={this.state.nodeCountValue}
          onChange={this.handleNodeCountChange}
          placeholder="Value of cluster n"
          type="text" />
      </div>
    );
  }
}

class SetupOptionalSettings extends React.Component {
  state = {
    ipValue: this.props.ipInitialValue,
    portValue: this.props.portValue
  };

  handleIpChange = (event) => {
    this.props.onAlterBindAddress(event);
    this.setState({ipValue: event.target.value});
  };

  handlePortChange = (event) => {
    this.props.onAlterPort(event);
    this.setState({portValue: event.target.value});
  };

  render() {
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
}

class SetupMultipleNodesController extends React.Component {
  getStoreState = () => {
    return {
      nodeList: setupStore.getNodeList(),
      isAdminParty: setupStore.getIsAdminParty(),
      remoteAddress: setupStore.getAdditionalNode().remoteAddress
    };
  };

  componentDidMount() {
    this.isAdminParty = setupStore.getIsAdminParty();
    setupStore.on('change', this.onChange, this);
  }

  componentWillUnmount() {
    setupStore.off('change', this.onChange);
  }

  onChange = () => {
    this.setState(this.getStoreState());
  };

  getNodeList = () => {
    return this.state.nodeList.map(function (el, i) {
      return (
        <div key={i} className="node-item">
          {el.remoteAddress}:{el.port}
        </div>
      );
    }, this);
  };

  addNode = () => {
    SetupActions.addNode(this.isAdminParty);
  };

  alterPortAdditionalNode = (e) => {
    SetupActions.alterPortAdditionalNode(e.target.value);
  };

  alterBindAddressAdditionalNode = (e) => {
    SetupActions.alterBindAddressAdditionalNode(e.target.value);
  };

  alterRemoteAddressAdditionalNode = (e) => {
    SetupActions.alterRemoteAddressAdditionalNode(e.target.value);
  };

  alterUsername = (e) => {
    SetupActions.setUsername(e.target.value);
  };

  alterPassword = (e) => {
    SetupActions.setPassword(e.target.value);
  };

  alterBindAddressSetupNode = (e) => {
    SetupActions.setBindAddressForSetupNode(e.target.value);
  };

  alterPortSetupNode = (e) => {
    SetupActions.setPortForSetupNode(e.target.value);
  };

  alterNodeCount = (e) => {
    SetupActions.setNodeCount(e.target.value);
  };

  finishClusterSetup = () => {
    SetupActions.finishClusterSetup('CouchDB Cluster set up!');
  };

  state = this.getStoreState();

  render() {

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
          <SetupNodeCountSetting
            onAlterNodeCount={this.alterNodeCount} />
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
}

class SetupSingleNodeController extends React.Component {
  getStoreState = () => {
    return {
      isAdminParty: setupStore.getIsAdminParty()
    };
  };

  componentDidMount() {
    setupStore.on('change', this.onChange, this);
  }

  componentWillUnmount() {
    setupStore.off('change', this.onChange);
  }

  onChange = () => {
    this.setState(this.getStoreState());
  };

  alterUsername = (e) => {
    SetupActions.setUsername(e.target.value);
  };

  alterPassword = (e) => {
    SetupActions.setPassword(e.target.value);
  };

  alterBindAddress = (e) => {
    SetupActions.setBindAddressForSetupNode(e.target.value);
  };

  alterPort = (e) => {
    SetupActions.setPortForSetupNode(e.target.value);
  };

  render() {
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
  }

  finishSingleNode = (e) => {
    e.preventDefault();
    SetupActions.setupSingleNode();
  };

  state = this.getStoreState();
}

class SetupFirstStepController extends React.Component {
  getStoreState = () => {
    return {
      clusterState: setupStore.getClusterState()
    };
  };

  componentDidMount() {
    setupStore.on('change', this.onChange, this);
  }

  componentWillUnmount() {
    setupStore.off('change', this.onChange);
  }

  onChange = () => {
    this.setState(this.getStoreState());
  };

  render() {
    if (this.state.clusterState === 'cluster_finished' ||
        this.state.clusterState === 'single_node_enabled') {
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
            text="Configure a Cluster" />
          <ConfirmButton
            onClick={this.redirectToSingleNodeSetup}
            showIcon={false}
            id="setup-btn-no-thanks"
            text="Configure a Single Node" />
        </div>
      </div>
    );
  }

  redirectToSingleNodeSetup = (e) => {
    e.preventDefault();
    FauxtonAPI.navigate('#setup/singlenode');
  };

  redirectToMultiNodeSetup = (e) => {
    e.preventDefault();
    FauxtonAPI.navigate('#setup/multinode');
  };

  state = this.getStoreState();
}

export default {
  SetupMultipleNodesController: SetupMultipleNodesController,
  SetupFirstStepController: SetupFirstStepController,
  ClusterConfiguredScreen: ClusterConfiguredScreen,
  SetupSingleNodeController: SetupSingleNodeController,
  SetupOptionalSettings: SetupOptionalSettings
};
