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
  './setup.actiontypes'

], function (FauxtonAPI, ActionTypes) {

  var SetupStore = FauxtonAPI.Store.extend({

    initialize: function () {
      this.reset();
    },

    reset: function () {
      this._clusterState = [];

      this._username = '';
      this._password = '';

      this._setupNode = {
        bindAddress: '0.0.0.0',
        port: 5984
      };

      this.resetAddtionalNode();

      this._nodeList = [];
    },

    resetAddtionalNode: function () {
      this._additionalNode = {
        bindAddress: '0.0.0.0',
        port: 5984,
        remoteAddress: '127.0.0.1'
      };
    },

    setClusterState: function (options) {
      this._clusterState = options.state;
    },

    getClusterState: function () {
      return this._clusterState;
    },

    getNodeList: function () {
      return this._nodeList;
    },

    getIsAdminParty: function () {
      return FauxtonAPI.session.isAdminParty();
    },

    setUsername: function (options) {
      this._username = options.value;
    },

    setPassword: function (options) {
      this._password = options.value;
    },

    getUsername: function () {
      return this._username;
    },

    getPassword: function () {
      return this._password;
    },

    setBindAdressForSetupNode: function (options) {
      this._setupNode.bindAddress = options.value;
    },

    setPortForSetupNode: function (options) {
      this._setupNode.port = options.value;
    },

    getPortForSetupNode: function () {
      return this._setupNode.port;
    },

    getBindAdressForSetupNode: function () {
      return this._setupNode.bindAddress;
    },

    setBindAdressForAdditionalNode: function (options) {
      this._additionalNode.bindAddress = options.value;
    },

    setPortForAdditionalNode: function (options) {
      this._additionalNode.port = options.value;
    },

    setRemoteAddressForAdditionalNode: function (options) {
      this._additionalNode.remoteAddress = options.value;
    },

    getAdditionalNode: function () {
      return this._additionalNode;
    },

    addNodeToList: function (options) {
      this._nodeList.push(options.value);
      this.resetAddtionalNode();
    },

    getHostForSetupNode: function () {
      return '127.0.0.1';
    },

    dispatch: function (action) {

      switch (action.type) {
        case ActionTypes.SETUP_SET_CLUSTERSTATUS:
          this.setClusterState(action.options);
        break;

        case ActionTypes.SETUP_SET_USERNAME:
          this.setUsername(action.options);
        break;

        case ActionTypes.SETUP_SET_PASSWORD:
          this.setPassword(action.options);
        break;

        case ActionTypes.SETUP_BIND_ADDRESS_FOR_SINGLE_NODE:
          this.setBindAdressForSetupNode(action.options);
        break;

        case ActionTypes.SETUP_PORT_FOR_SINGLE_NODE:
          this.setPortForSetupNode(action.options);
        break;

        case ActionTypes.SETUP_PORT_ADDITIONAL_NODE:
          this.setPortForAdditionalNode(action.options);
        break;

        case ActionTypes.SETUP_BIND_ADDRESS_ADDITIONAL_NODE:
          this.setBindAdressForAdditionalNode(action.options);
        break;

        case ActionTypes.SETUP_REMOTE_ADDRESS_ADDITIONAL_NODE:
          this.setRemoteAddressForAdditionalNode(action.options);
        break;

        case ActionTypes.SETUP_ADD_NODE_TO_LIST:
          this.addNodeToList(action.options);
        break;

        case ActionTypes.SETUP_RESET_ADDITIONAL_NODE:
          this.resetAddtionalNode();
        break;


        default:
        return;
      }

      this.triggerChange();
    }

  });


  var setupStore = new SetupStore();

  setupStore.dispatchToken = FauxtonAPI.dispatcher.register(setupStore.dispatch.bind(setupStore));

  return {
    setupStore: setupStore,
    SetupStore: SetupStore
  };
});
