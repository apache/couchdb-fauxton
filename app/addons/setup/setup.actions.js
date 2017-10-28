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
import SetupResources from "./resources";
import ActionTypes from "./setup.actiontypes";
import SetupStores from "./setup.stores";
import Api from "../auth/api";
var setupStore = SetupStores.setupStore;

export default {

  getClusterStateFromCouch: function () {
    var setupData = new SetupResources.Model();

    setupData.fetch().then(function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.SETUP_SET_CLUSTERSTATUS,
        options: {
          state: setupData.get('state')
        }
      });
    });
  },

  finishClusterSetup: function (message) {

    $.ajax({
      type: 'POST',
      url: '/_cluster_setup',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({
        action: 'finish_cluster'
      })
    })
    .success(function () {
      FauxtonAPI.addNotification({
        msg: message,
        type: 'success',
        fade: false,
        clear: true
      });
      FauxtonAPI.navigate('#setup/finish');
    })
    .fail(function () {
      FauxtonAPI.addNotification({
        msg: 'There was an error. Please check your setup and try again.',
        type: 'error',
        fade: false,
        clear: true
      });
    });

  },

  setupSingleNode: function () {
    var username = setupStore.getUsername();
    var password = setupStore.getPassword();

    var setupModel = new SetupResources.Model({
      action: 'enable_single_node',
      username: username,
      password: password,
      bind_address: setupStore.getBindAdressForSetupNode(),
      port: setupStore.getPortForSetupNode(),
      singlenode: true
    });

    setupModel.on('invalid', function (model, error) {
      FauxtonAPI.addNotification({
        msg: error,
        type: 'error',
        fade: false,
        clear: true
      });
    });

    setupModel.save()
      .then(function () {
        return Api.login({name: username, password});
      })
      .then(function () {
        FauxtonAPI.addNotification({
          msg: 'Single node setup successful.',
          type: 'success',
          fade: false,
          clear: true
        });
        FauxtonAPI.navigate('#setup/finish');
      }.bind(this));
  },

  addNode: function (isOrWasAdminParty) {
    var username = setupStore.getUsername();
    var password = setupStore.getPassword();
    var portForSetupNode = setupStore.getPortForSetupNode();
    var bindAddressForSetupNode = setupStore.getBindAdressForSetupNode();
    var nodeCountForSetupNode = setupStore.getNodeCountForSetupNode();

    var bindAddressForAdditionalNode = setupStore.getAdditionalNode().bindAddress;
    var remoteAddressForAdditionalNode = setupStore.getAdditionalNode().remoteAddress;
    var portForForAdditionalNode = setupStore.getAdditionalNode().port;


    var setupNode = new SetupResources.Model({
      action: 'enable_cluster',
      username: username,
      password: password,
      bind_address: bindAddressForSetupNode,
      port: portForSetupNode,
      node_count: nodeCountForSetupNode,
      singlenode: false
    });

    setupNode.on('invalid', function (model, error) {
      FauxtonAPI.addNotification({
        msg: error,
        type: 'error',
        fade: false,
        clear: true
      });
    });

    var additionalNodeData = {
      action: 'enable_cluster',
      username: username,
      password: password,
      bind_address: bindAddressForAdditionalNode,
      port: portForForAdditionalNode,
      node_count: nodeCountForSetupNode,
      remote_node: remoteAddressForAdditionalNode,
      remote_current_user: username,
      remote_current_password: password
    };

    if (isOrWasAdminParty) {
      delete additionalNodeData.remote_current_user;
      delete additionalNodeData.remote_current_password;
    }

    var additionalNode = new SetupResources.Model(additionalNodeData);

    additionalNode.on('invalid', function (model, error) {
      FauxtonAPI.addNotification({
        msg: error,
        type: 'error',
        fade: false,
        clear: true
      });
    });
    setupNode
      .save()
      .always(function () {
        Api.login({name: username, password}).then(function() {
          continueSetup();
        });
      });

    function continueSetup () {
      var addNodeModel = new SetupResources.Model({
        action: 'add_node',
        username: username,
        password: password,
        host: remoteAddressForAdditionalNode,
        port: portForForAdditionalNode,
        singlenode: false
      });

      additionalNode
        .save()
        .then(function () {
          return addNodeModel.save();
        })
        .then(function () {
          FauxtonAPI.dispatch({
            type: ActionTypes.SETUP_ADD_NODE_TO_LIST,
            options: {
              value: {
                port: portForForAdditionalNode,
                remoteAddress: remoteAddressForAdditionalNode
              }
            }
          });
          FauxtonAPI.addNotification({
            msg: 'Added node',
            type: 'success',
            fade: false,
            clear: true
          });
        })
        .fail(function (xhr) {
          var responseText = JSON.parse(xhr.responseText).reason;
          FauxtonAPI.addNotification({
            msg: 'Adding node failed: ' + responseText,
            type: 'error',
            fade: false,
            clear: true
          });
        });
    }
  },

  resetAddtionalNodeForm: function () {
    FauxtonAPI.dispatch({
      type: ActionTypes.SETUP_RESET_ADDITIONAL_NODE,
    });
  },

  alterPortAdditionalNode: function (value) {
    FauxtonAPI.dispatch({
      type: ActionTypes.SETUP_PORT_ADDITIONAL_NODE,
      options: {
        value: value
      }
    });
  },

  alterRemoteAddressAdditionalNode: function (value) {
    FauxtonAPI.dispatch({
      type: ActionTypes.SETUP_REMOTE_ADDRESS_ADDITIONAL_NODE,
      options: {
        value: value
      }
    });
  },

  alterBindAddressAdditionalNode: function (value) {
    FauxtonAPI.dispatch({
      type: ActionTypes.SETUP_BIND_ADDRESS_ADDITIONAL_NODE,
      options: {
        value: value
      }
    });
  },

  setUsername: function (value) {
    FauxtonAPI.dispatch({
      type: ActionTypes.SETUP_SET_USERNAME,
      options: {
        value: value
      }
    });
  },

  setPassword: function (value) {
    FauxtonAPI.dispatch({
      type: ActionTypes.SETUP_SET_PASSWORD,
      options: {
        value: value
      }
    });
  },

  setPortForSetupNode: function (value) {
    FauxtonAPI.dispatch({
      type: ActionTypes.SETUP_PORT_FOR_SINGLE_NODE,
      options: {
        value: value
      }
    });
  },

  setBindAddressForSetupNode: function (value) {
    FauxtonAPI.dispatch({
      type: ActionTypes.SETUP_BIND_ADDRESS_FOR_SINGLE_NODE,
      options: {
        value: value
      }
    });
  },

  setNodeCount: function (value) {
    FauxtonAPI.dispatch({
      type: ActionTypes.SETUP_NODE_COUNT,
      options: {
        value: value
      }
    });
  }
};
