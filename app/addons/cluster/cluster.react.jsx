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

define([
  '../../app',
  '../../core/api',
  'react',
  './cluster.stores'
],

function (app, FauxtonAPI, React, ClusterStore) {

  var nodesStore = ClusterStore.nodesStore;


  var DisabledConfigController = React.createClass({

    getStoreState: function () {
      return {
        nodes: nodesStore.getNodes()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      nodesStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      nodesStore.off('change', this.onChange);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    render: function () {
      return (
        <div className="config-warning-cluster-wrapper">
          <div className="config-warning-cluster-container">
            <div>
              <div className="config-warning-icon-container pull-left">
                <i className="fonticon-attention-circled"></i>
              </div>
              It seems that you are running a cluster with {this.state.nodes.length} nodes. For CouchDB 2.0
              we recommend using a configuration management tools like Chef, Ansible,
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
  });

  var Views = {
    DisabledConfigController: DisabledConfigController
  };

  return Views;

});
