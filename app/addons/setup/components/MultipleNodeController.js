import SetupActions from "../actions";
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

    addNode = () => {
        const {username, password} = this.props;
        SetupActions.addNode(
            this.isAdminParty,
            {username, password},
            this.props.setupNode,
            this.props.additionalNode
        );
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

    render() {
        const {username, password, isAdminParty, setupNode, additionalNode} = this.props;
        return (
            <div className="setup-nodes">
                Setup your initial base-node, afterwards add the other nodes that you want to add
                <div className="setup-setupnode-section">
                    <CurrentAdminPassword
                        onAlterUsername={this.alterUsername}
                        onAlterPassword={this.alterPassword}
                        adminParty={isAdminParty}
                        password={password}
                        username={username}/>

                    <OptionalSettings
                        onAlterPort={this.alterPortSetupNode}
                        onAlterBindAddress={this.alterBindAddressSetupNode} ip={setupNode.bindAddress}
                        port={setupNode.port}/>
                    <NodeCountSetting
                        onAlterNodeCount={this.alterNodeCount} nodeCount={setupNode.nodeCount}/>
                </div>
                <hr/>
                <div className="setup-add-nodes-section">
                    <h2>Add Nodes to the Cluster</h2>
                    <p>Remote host</p>
                    <input
                        value={additionalNode.remoteAddress}
                        onChange={this.alterRemoteAddressAdditionalNode}
                        className="input-remote-node"
                        type="text"
                        placeholder="IP Address"/>

                    <OptionalSettings
                        onAlterPort={this.alterPortAdditionalNode}
                        onAlterBindAddress={this.alterBindAddressAdditionalNode}
                        ip={additionalNode.bindAddress} port={additionalNode.port}/>

                    <div className="setup-add-button">
                        <ConfirmButton
                            onClick={this.addNode}
                            showIcon={false}
                            id="setup-btn-no-thanks"
                            text="Add Node"/>
                    </div>
                </div>
                <div className="setup-nodelist">
                    {this.getNodeList()}
                </div>

                <div className="centered setup-finish">
                    <ConfirmButton onClick={this.finishClusterSetup} showIcon={false} text="Configure Cluster"/>
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
