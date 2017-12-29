import React from 'react';
import PropTypes from 'prop-types';
import SetupActions from '../actions';
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
                    <CurrentAdminPassword
                        onAlterUsername={this.alterUsername}
                        onAlterPassword={this.alterPassword}
                        adminParty={this.props.isAdminParty}
                        username={this.props.username}
                        password={this.props.password}/>
                    <OptionalSettings
                        onAlterPort={this.alterPort}
                        onAlterBindAddress={this.alterBindAddress}
                        ip={this.props.bindAddress} port={this.props.port}/>
                    <ConfirmButton
                        onClick={this.finishSingleNode}
                        text="Configure Node"/>
                </div>
            </div>
        );
    }

    finishSingleNode = (e) => {
        e.preventDefault();
        const {username, password, port, bindAddress} = this.props;
        const credentials = {username, password};
        const setupNode = {
            port,
            bindAddress,
        };
        SetupActions.setupSingleNode(credentials, setupNode);
    };
}

SingleNodeController.propTypes = {
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    port: PropTypes.number.isRequired,
    bindAddress: PropTypes.string.isRequired,
    isAdminParty: PropTypes.bool.isRequired
};
