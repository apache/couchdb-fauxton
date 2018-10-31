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
import React from 'react';
import PropTypes from 'prop-types';
import ReactComponents from "../../components/react-components";
import CurrentAdminPassword from "./CurrentAdminPassword";
import OptionalSettings from "./OptionalSettings";
import NodeCountSetting from "./NodeCountSetting";

import {getIsAdminParty} from '../reducers';


const ConfirmButton = ReactComponents.ConfirmButton;

export default class MultipleNodesController extends React.Component {

  componentDidMount() {
    this.isAdminParty = getIsAdminParty();
  }

  getNodeList = () => {
    return this.props.nodeList.map((el, i) => {
      return (
        <div key={i} className="node-item">
          {el.remoteAddress}:{el.port}
        </div>
      );
    });
  };

  _addNode = () => {
    const {username, password, setupNode, additionalNode} = this.props;
    this.props.addNode(this.isAdminParty, {username, password}, setupNode, additionalNode);
  };

  _alterPortAdditionalNode = (e) => {
    this.props.alterPortAdditionalNode(e.target.value);
  };

  _alterBindAddressAdditionalNode = (e) => {
    this.props.alterBindAddressAdditionalNode(e.target.value);
  };

  _alterRemoteAddressAdditionalNode = (e) => {
    this.props.alterRemoteAddressAdditionalNode(e.target.value);
  };

  _alterUsername = (e) => {
    this.props.alterUsername(e.target.value);
  };

  _alterPassword = (e) => {
    this.props.alterPassword(e.target.value);
  };

  _alterBindAddressSetupNode = (e) => {
    this.props.alterBindAddressForSetupNode(e.target.value);
  };

  _alterPortSetupNode = (e) => {
    this.props.alterPortForSetupNode(e.target.value);
  };

  _alterNodeCount = (e) => {
    this.props.alterNodeCount(e.target.value);
  };

  _finishClusterSetup = () => {
    this.props.finishClusterSetup('CouchDB Cluster set up!');
  };

  render() {
    const {setupNode, additionalNode} = this.props;
    return (
      <div className="setup-nodes">
          Setup your initial base-node, afterwards add the other nodes that you want to add
        <div className="setup-setupnode-section">
          <CurrentAdminPassword
            {...this.props}
            onAlterUsername={this._alterUsername}
            onAlterPassword={this._alterPassword}/>

          <OptionalSettings
            {...this.props}
            onAlterPort={this._alterPortSetupNode}
            onAlterBindAddress={this._alterBindAddressSetupNode}
            ip={setupNode.bindAddress}
            port={setupNode.port}/>
          <NodeCountSetting
            {...this.props}
            onAlterNodeCount={this._alterNodeCount}
            nodeCount={setupNode.nodeCount}/>
        </div>
        <hr/>
        <div className="setup-add-nodes-section">
          <h2>Add Nodes to the Cluster</h2>
          <p>Remote host</p>
          <input
            value={additionalNode.remoteAddress}
            onChange={this._alterRemoteAddressAdditionalNode}
            className="input-remote-node"
            type="text"
            placeholder="IP Address"/>
          <OptionalSettings
            {...this.props}
            onAlterPort={this._alterPortAdditionalNode}
            onAlterBindAddress={this._alterBindAddressAdditionalNode}
            ip={additionalNode.bindAddress} port={additionalNode.port}/>

          <div className="setup-add-button">
            <ConfirmButton
              onClick={this._addNode}
              showIcon={false}
              id="setup-btn-no-thanks"
              text="Add Node"/>
          </div>
        </div>
        <div className="setup-nodelist">
          {this.getNodeList()}
        </div>

        <div className="centered setup-finish">
          <ConfirmButton
            onClick={this._finishClusterSetup}
            showIcon={false}
            text="Configure Cluster"/>
        </div>
      </div>
    );
  }
}

MultipleNodesController.propTypes = {
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  nodeList: PropTypes.array.isRequired,
  isAdminParty: PropTypes.bool.isRequired,
  setupNode: PropTypes.shape({
    bindAddress: PropTypes.string.isRequired,
    port: PropTypes.number.isRequired,
    nodeCount: PropTypes.number.isRequired
  }).isRequired,
  additionalNode: PropTypes.shape({
    bindAddress: PropTypes.string.isRequired,
    port: PropTypes.number.isRequired,
    remoteAddress: PropTypes.string.isRequired
  }).isRequired
};
