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

const ConfirmButton = ReactComponents.ConfirmButton;

export default class SingleNodeController extends React.Component {

  constructor() {
    super();
    this.finishSingleNode = this.finishSingleNode.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onChangeBindAddress = this.onChangeBindAddress.bind(this);
    this.onChangePort = this.onChangePort.bind(this);
  }

  onChangeUsername = e => this.props.alterUsername(e.target.value);

  onChangePassword = e => this.props.alterPassword(e.target.value);

  onChangeBindAddress = e => this.props.alterBindAddress(e.target.value);

  onChangePort = e => this.props.alterPort(e.target.value);

  render() {
    return (
      <div className="setup-nodes">
        <div className="setup-setupnode-section">
          <CurrentAdminPassword
            {...this.props}
            onAlterUsername={this.onChangeUsername}
            onAlterPassword={this.onChangePassword}/>
          <OptionalSettings
            {...this.props}
            onAlterPort={this.onChangePort}
            onAlterBindAddress={this.onChangeBindAddress}
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
    const {username, password, port, bindAddress} = this.props;
    const credentials = {username, password};
    const setupNode = {
      port,
      bindAddress,
    };
    this.props.setupSingleNode(credentials, setupNode);
  };
}

SingleNodeController.propTypes = {
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  port: PropTypes.number.isRequired,
  bindAddress: PropTypes.string.isRequired,
  isAdminParty: PropTypes.bool.isRequired
};
