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
  'app',
  'api',
  'react',
  'addons/config/config.stores'

],

function (app, FauxtonAPI, React, ConfigStores) {

  var nodesStore = ConfigStores.nodesStore;


  var ConfigController = React.createClass({

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

    getNodeLinkList: function () {
      return this.state.nodes.map(function (item) {
        var checkIcon = null;
        if (item.isInCluster) {
          checkIcon = (<i className="icon fonticon-ok"></i>);
        }

        return (
          <tr key={item.node}>
            <td><a href={"#_config/" + item.node}>{item.node}</a></td>
            <td className="config-part-of-cluster">{checkIcon}</td>
          </tr>
        );
      });
    },

    render: function () {
      return (
        <div>
          <div>Choose which node of your cluster you want to edit:</div>
          <br/>
          <br/>
          <table className="config-nodes table table-striped">
            <thead>
              <th>Node</th>
              <th className="config-part-of-cluster">Part of the cluster</th>
            </thead>
            <tbody>
              {this.getNodeLinkList()}
            </tbody>
          </table>

        </div>
      );
    }
  });

  var Views = {
    ConfigController: ConfigController
  };

  return Views;

});
