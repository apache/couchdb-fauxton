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
import app from "../../../app";


export default class ClusterConfiguredScreen extends React.Component {
  getNodeType = () => {
    const {clusterState} = this.props;
    if (clusterState === 'cluster_finished') {
      return 'clustered';
    } else if (clusterState === 'single_node_enabled') {
      return 'single';
    }
    return 'unknown state';

  };

  render() {
    const nodetype = this.getNodeType();

    return (
      <div className="setup-screen">
        {app.i18n.en_US['couchdb-productname']} is configured for production usage as a {nodetype} node!
        <br/>
        <br/>
          Do you want to <a href="#replication">replicate data</a>?
      </div>
    );
  }
}

ClusterConfiguredScreen.propTypes = {
  clusterState: PropTypes.string
};
