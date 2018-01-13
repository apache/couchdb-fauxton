import React from 'react';
import PropTypes from 'prop-types';
import {
    setBindAddressForSetupNode,
    setPassword,
    setPortForSetupNode,
    setupSingleNode,
    setUsername
} from '../actions';
import ReactComponents from "../../components/react-components";
import CurrentAdminPassword from "./CurrentAdminPassword";
import OptionalSettings from "./OptionalSettings";

const ConfirmButton = ReactComponents.ConfirmButton;

export default class SingleNodeController extends React.Component {

    constructor() {
        super();
        this.finishSingleNode = this.finishSingleNode.bind(this);
    }

    alterUsername = (e) => {
        this.props.dispatch(setUsername(e.target.value));
    };

    alterPassword = (e) => {
        this.props.dispatch(setPassword(e.target.value));
    };

    alterBindAddress = (e) => {
        this.props.dispatch(setBindAddressForSetupNode(e.target.value));
    };

    alterPort = (e) => {
        this.props.dispatch(setPortForSetupNode(e.target.value));
    };

    render() {
        return (
            <div className="setup-nodes">
                <div className="setup-setupnode-section">
                    <CurrentAdminPassword
                        {...this.props}
                        onAlterUsername={this.alterUsername}
                        onAlterPassword={this.alterPassword}/>
                    <OptionalSettings
                        {...this.props}
                        onAlterPort={this.alterPort}
                        onAlterBindAddress={this.alterBindAddress}
                        ip={this.props.bindAddress}
                        port={this.props.port}/>
                    <ConfirmButton
                        {...this.props}
                        onClick={this.finishSingleNode}
                        text="Configure Node"/>
                </div>
            </div>
        );
    }

    finishSingleNode = (e) => {
        e.preventDefault();
        const {username, password, port, bindAddress, dispatch} = this.props;
        const credentials = {username, password};
        const setupNode = {
            port,
            bindAddress,
        };
        dispatch(setupSingleNode(credentials, setupNode));
    };
}

SingleNodeController.propTypes = {
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    port: PropTypes.number.isRequired,
    bindAddress: PropTypes.string.isRequired,
    isAdminParty: PropTypes.bool.isRequired
};
