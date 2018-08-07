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
import {isInvalid} from "./helpers";
import {
  SETUP_ADD_NODE_TO_LIST,
  SETUP_BIND_ADDRESS_ADDITIONAL_NODE,
  SETUP_BIND_ADDRESS_FOR_SINGLE_NODE,
  SETUP_NODE_COUNT,
  SETUP_PORT_ADDITIONAL_NODE,
  SETUP_PORT_FOR_SINGLE_NODE,
  SETUP_REMOTE_ADDRESS_ADDITIONAL_NODE,
  SETUP_RESET_ADDITIONAL_NODE,
  SETUP_SET_CLUSTERSTATUS,
  SETUP_SET_PASSWORD,
  SETUP_SET_USERNAME
} from "./actiontypes";
import {get, post} from '../../core/ajax';
import Api from "../auth/api";


/**
 * @typedef {Object} CredentialObject
 * @param {string} username The username
 * @param {string} password The password
 */


/**
 * Public functions
 */

const showError = (msg, error) => {
  const errorMsg = error ? ' Error:' + error : '';
  FauxtonAPI.addNotification({
    msg: msg + errorMsg,
    type: 'error',
    fade: false,
    clear: true
  });
  return;
};


export const getClusterStateFromCouch = () => async dispatch => {
  const baseUrl = FauxtonAPI.urls('cluster_setup', 'server');
  const json = await get(baseUrl);
  dispatch({
    type: SETUP_SET_CLUSTERSTATUS,
    options: {
      state: json.state
    }
  });
};

export const finishClusterSetup = message => async() => {
  const baseUrl = FauxtonAPI.urls('cluster_setup', 'server');
  const body = {action: 'finish_cluster'};
  try {
    const response = await post(baseUrl, body, {raw: true});
    if (response.ok) {
      FauxtonAPI.addNotification({
        msg: message,
        type: 'success',
        fade: false,
        clear: true
      });
      FauxtonAPI.navigate('#setup/finish');
    } else {
      const json = await response.json();
      showError('The cluster is already finished', json.reason);
    }
  } catch (err) {
    showError('There was an error. Please check your setup and try again.', err);
  }
};

export const setupSingleNode = (credentials, setupNode) => async() => {
  const baseUrl = FauxtonAPI.urls('cluster_setup', 'server');
  const setupAttrs = {
    action: 'enable_single_node',
    username: credentials.username,
    password: credentials.password,
    bind_address: setupNode.bindAddress,
    port: setupNode.port,
    singlenode: true
  };

  const attrsAreInvalid = isInvalid(setupAttrs);

  if (attrsAreInvalid) {
    return showError(attrsAreInvalid);
  }

  try {
    const response = await post(baseUrl, setupAttrs, {raw: true});
    if (!response.ok) {
      const json = await response.json();
      const error = json.reason ? json.reason : json.error;
      return showError(error);
    }

    await Api.login({name: credentials.username, password: credentials.password});
    FauxtonAPI.addNotification({
      msg: 'Single node setup successful.',
      type: 'success',
      fade: false,
      clear: true
    });
    FauxtonAPI.navigate('#setup/finish');
  } catch (error) {
    showError("The cluster has not been setuped successfully.", error);
  }
};

/**
 * Add a node to the current cluster configuration
 * 1. Enable cluster for the current node
 * 2. Enable cluster for the remote node
 * 3. Add the remote node
 * @param isOrWasAdminParty
 * @param credentials
 * @param setupNode
 * @param additionalNode
 */
export const addNode = (isOrWasAdminParty, credentials, setupNode, additionalNode) => async dispatch => {
  const baseUrl = FauxtonAPI.urls('cluster_setup', 'server');
  const enableSetupData = {
    action: 'enable_cluster',
    username: credentials.username,
    password: credentials.password,
    bind_address: setupNode.bindAddress,
    port: setupNode.port,
    node_count: setupNode.nodeCount,
    singlenode: false
  };

  const attrsAreInvalid = isInvalid({
    username: credentials.username,
    password: credentials.password,
    ...setupNode
  });

  if (attrsAreInvalid) {
    return showError(attrsAreInvalid);
  }

  let enableNodeData = {
    action: 'enable_cluster',
    username: credentials.username,
    password: credentials.password,
    bind_address: additionalNode.bindAddress,
    port: additionalNode.port,
    node_count: setupNode.nodeCount,
    remote_node: additionalNode.remoteAddress,
    remote_current_user: credentials.username,
    remote_current_password: credentials.password
  };

  if (isOrWasAdminParty) {
    delete enableNodeData.remote_current_user;
    delete enableNodeData.remote_current_password;
  }

  const additionalNodeDataIsInvalid = isInvalid(enableNodeData);

  if (additionalNodeDataIsInvalid) {
    return showError(additionalNodeDataIsInvalid);
  }

  const continueSetup = async() => {
    const addNodeData = {
      action: 'add_node',
      username: credentials.username,
      password: credentials.password,
      host: additionalNode.remoteAddress,
      port: additionalNode.port,
      singlenode: false
    };

    //Enable the remote node
    const enableRemoteNodeResponse = await post(baseUrl, enableNodeData, {raw: true});

    if (!enableRemoteNodeResponse.ok) {
      const json = await enableRemoteNodeResponse.json();
      const error = json.reason ? json.reason : json.error;
      return showError(error);
    }
    const addNodeResponse = await post(baseUrl, addNodeData, {raw: true});

    if (!addNodeResponse.ok) {
      const json = await addNodeResponse.json();
      const error = json.reason ? json.reason : json.error;
      return showError(error);
    }

    dispatch({
      type: SETUP_ADD_NODE_TO_LIST,
      options: {
        value: {
          port: additionalNode.port,
          remoteAddress: additionalNode.remoteAddress
        }
      }
    });
    FauxtonAPI.addNotification({
      msg: 'Added node',
      type: 'success',
      fade: false,
      clear: true
    });
  };
  try {
    await post(baseUrl, enableSetupData, {raw: true});
    await Api.login({name: credentials.username, password: credentials.password});
    await continueSetup();
  } catch (err) {
    showError('An error occured while adding the node.', err);
  }
};

export const resetAddtionalNodeForm = () => {
  return {
    type: SETUP_RESET_ADDITIONAL_NODE,
  };
};

export const alterPortAdditionalNode = value => {
  return {
    type: SETUP_PORT_ADDITIONAL_NODE,
    options: {
      value: value
    }
  };
};

export const alterRemoteAddressAdditionalNode = value => {
  return {
    type: SETUP_REMOTE_ADDRESS_ADDITIONAL_NODE,
    options: {
      value: value
    }
  };
};

export const alterBindAddressAdditionalNode = value => {
  return {
    type: SETUP_BIND_ADDRESS_ADDITIONAL_NODE,
    options: {
      value: value
    }
  };
};

export const setUsername = value => {
  return {
    type: SETUP_SET_USERNAME,
    options: {
      value: value
    }
  };
};

export const setPassword = value => {
  return {
    type: SETUP_SET_PASSWORD,
    options: {
      value: value
    }
  };
};

export const setPortForSetupNode = value => {
  return {
    type: SETUP_PORT_FOR_SINGLE_NODE,
    options: {
      value: value
    }
  };
};

export const setBindAddressForSetupNode = value => {
  return {
    type: SETUP_BIND_ADDRESS_FOR_SINGLE_NODE,
    options: {
      value: value
    }
  };
};

export const setNodeCount = value => {
  return {
    type: SETUP_NODE_COUNT,
    options: {
      value: value
    }
  };
};


