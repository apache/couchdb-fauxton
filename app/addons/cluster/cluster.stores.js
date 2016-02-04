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
  '../../core/api',
  './cluster.actiontypes'
], function (FauxtonAPI, ActionTypes) {

  var NodesStore = FauxtonAPI.Store.extend({

    initialize: function () {
      this.reset();
    },

    reset: function () {
      this._nodes = [];
    },

    setNodes: function (options) {
      this._nodes = options.nodes;
    },

    getNodes: function () {
      return this._nodes;
    },

    dispatch: function (action) {

      switch (action.type) {
        case ActionTypes.CLUSTER_FETCH_NODES:
          this.setNodes(action.options);
        break;

        default:
        return;
      }

      this.triggerChange();
    }

  });


  var nodesStore = new NodesStore();

  nodesStore.dispatchToken = FauxtonAPI.dispatcher.register(nodesStore.dispatch.bind(nodesStore));

  return {
    nodesStore: nodesStore
  };
});
