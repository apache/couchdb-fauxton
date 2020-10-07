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

import React from "react";
import {connect} from 'react-redux';

export class DisabledConfigController extends React.Component {
  render() {
    return (
      <div className="config-warning-cluster-wrapper">
        <div className="config-warning-cluster-container">
          <div>
            <div className="config-warning-icon-container pull-left">
              <i className="fonticon-attention-circled"></i>
            </div>
            It seems that you are running a cluster with {this.props.nodes.length} nodes. For CouchDB 2.0
            or greater we recommend using a configuration management tools like Chef, Ansible,
            Puppet or Salt (in no particular order) to configure your nodes in a cluster.
            <br/>
            <br/>
            <div className="config-warning-other-text">
              We highly recommend against configuring nodes in your cluster using the HTTP API and
              suggest using a configuration management tool for all configurations.
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({clusters}) => {
  return {
    nodes: clusters.nodes
  };
};

export default connect(
  mapStateToProps,
  null,
)(DisabledConfigController);
