import {
  addNode,
  alterBindAddressAdditionalNode,
  alterPortAdditionalNode,
  alterRemoteAddressAdditionalNode,
  finishClusterSetup,
  setBindAddressForSetupNode,
  setNodeCount,
  setPassword,
  setPortForSetupNode,
  setUsername
} from "../actions";
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
    return this.props.nodeList.map(function (el, i) {
      return (
        <div key={i} className="node-item">
          {el.remoteAddress}:{el.port}
        </div>
      );
    }, this);
  };

  _addNode = () => {
    const {username, password} = this.props;
    this.props.dispatch(addNode(
      this.isAdminParty,
      {username, password},
      this.props.setupNode,
      this.props.additionalNode
    ));
  };

  _alterPortAdditionalNode = (e) => {
    this.props.dispatch(alterPortAdditionalNode(e.target.value));
  };

  _alterBindAddressAdditionalNode = (e) => {
    this.props.dispatch(alterBindAddressAdditionalNode(e.target.value));
  };

  _alterRemoteAddressAdditionalNode = (e) => {
    this.props.dispatch(alterRemoteAddressAdditionalNode(e.target.value));
  };

  _alterUsername = (e) => {
    this.props.dispatch(setUsername(e.target.value));
  };

  _alterPassword = (e) => {
    this.props.dispatch(setPassword(e.target.value));
  };

  _alterBindAddressSetupNode = (e) => {
    this.props.dispatch(setBindAddressForSetupNode(e.target.value));
  };

  _alterPortSetupNode = (e) => {
    this.props.dispatch(setPortForSetupNode(e.target.value));
  };

  _alterNodeCount = (e) => {
    this.props.dispatch(setNodeCount(e.target.value));
  };

  _finishClusterSetup = () => {
    this.props.dispatch(finishClusterSetup('CouchDB Cluster set up!'));
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
