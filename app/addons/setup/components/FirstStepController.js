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
import app from "../../../app";
import PropTypes from 'prop-types';
import FauxtonAPI from "../../../core/api";
import ClusterConfiguredScreen from "./ConfiguredScreen";
import ReactComponents from "../../components/react-components";

const ConfirmButton = ReactComponents.ConfirmButton;

export default class FirstStepController extends React.Component {

  UNSAFE_componentWillMount() {
    this.props.getClusterState();
  }

  render() {
    if (this.props.clusterState === 'cluster_finished' ||
        this.props.clusterState === 'single_node_enabled') {
      return (<ClusterConfiguredScreen {...this.props}/>);
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
            text="Configure a Cluster"/>
          <ConfirmButton
            onClick={this.redirectToSingleNodeSetup}
            showIcon={false}
            id="setup-btn-no-thanks"
            text="Configure a Single Node"/>
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

}

FirstStepController.propTypes = {
  clusterState: PropTypes.string
};
