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

import FauxtonAPI from "../../core/api";
import getNodes from "./api";
import ActionTypes from "./actiontypes";

export default {
  fetchNodes () {
    getNodes().then((nodes) => {
      this.updateNodes({
        nodes: nodes.nodes_mapped
      });
    })
      .catch(err => {
        FauxtonAPI.addNotification({
          type: 'error',
          msg: err.message,
          clear: true
        });
      });
  },

  updateNodes (options) {
    FauxtonAPI.reduxDispatch({
      type: ActionTypes.CLUSTER_FETCH_NODES,
      options: options
    });
  },

  navigateToNodeBasedOnNodeCount (successtarget) {
    getNodes().then((nodes) => {
      const allNodes = nodes.all_nodes;

      if (allNodes.length === 1) {
        return FauxtonAPI.navigate(successtarget + allNodes[0]);
      }
      return FauxtonAPI.navigate('/cluster/disabled', {trigger: true});
    })
      .catch(err => {
        FauxtonAPI.addNotification({
          type: 'error',
          msg: err.message,
          clear: true
        });
      });
  }

};
